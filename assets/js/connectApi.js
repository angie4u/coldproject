const customApiUrl = "https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/e1381295-16e1-4073-9ea9-c9585e8ffe10/"
const customApiKey = "79ea46b6255542e285abd8d1be7249fe";

const inputStorageUrl = "https://krnoodlestorage.blob.core.windows.net/input/";
const outputStorageUrl = "https://krnoodlestorage.blob.core.windows.net/thumbnail/";
const storageSAS = "?st=2017-08-29T05%3A21%3A00Z&se=2017-12-31T05%3A21%3A00Z&sp=rwdl&sv=2015-12-11&sr=c&sig=yXmI8FEk23%2BRlb4CowdBdmxtLp1Su%2F03LRjZ34qyUN0%3D";

$(document).ready(function () {
    //사용자가 URL 입력 후 전송 버튼을 눌렀을 떄 동작하는 코드
    $('#urlSendButton').click(function () {
        $.ajax({
            //PERFORMANCE 탭의 Prediction URL 에서 상단의 image URL 부분 참조 
            url: customApiUrl+"url",
            method: 'POST',
            headers: {
                //PERFORMANCE 탭의 Prediction URL 에서 Prediction-Key 참조 
                "prediction-key": customApiKey,
                "content-type": "application/x-www-form-urlencoded"
            },
            data: {
                Url: $('#imgUrl').val()
            },
            dataType: 'text',
            success: function (data) {
                parseSuccessMessage(data);
                document.getElementById('urlForm').reset();
            }
        });
    });
});

$(document).ready(function () {
    //사용자가 파일 선택 후 전송 버튼을 눌렀을 때 동작하는 코드 
    $('#fileSendButton').click(function () {
        var form = $('#fileForm')[0];
        var formData = new FormData(form);
        formData.append("fileObj", $("#fileTag")[0].files[0]);

        var imageSize = $("#fileTag")[0].files[0].size;
        

        //image 크기가 4MB 보다 큰경우
        if(imageSize > 4194304)
        {
            //이미지 전송 여부 묻기 
            if (confirm('이미지가 너무 큽니다.. 이미지 줄여서 전송할까요?')) {
            
                //이미지가 크므로 Azure Function 호출하여 이미지 리사이즈 및 output storage에 저장
                var fileData = $("#fileTag")[0].files[0];
                connectToAzureStroage(fileData);

                //이미지가 저장된 Url을 이용하여 다시금 POST요청 
                var resizedImageUrl = outputStorageUrl+fileData.name;

                $.ajax({
                    //PERFORMANCE 탭의 Prediction URL 에서 상단의 image URL 부분 참조 
                    url: customApiUrl+"url",
                    method: 'POST',
                    headers: {
                        //PERFORMANCE 탭의 Prediction URL 에서 Prediction-Key 참조 
                        "prediction-key": customApiKey,
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    data: {
                        Url: resizedImageUrl
                    },
                    dataType: 'text',
                    success: function (data) {
                        parseSuccessMessage(data);
                        document.getElementById('urlForm').reset();
                    }
                });


            } 
            else {
                // Do nothing!
                var resultMessage = "<h1>이미지가 너무 커서 업로드에 실패했습니다...</h1>";
                document.getElementById('resultContainer').innerHTML = resultMessage;
                document.getElementById('fileForm').reset();

            }
            
            
        }
        else{
            $.ajax({
                //PERFORMANCE 탭의 Prediction URL 에서 하단의 image file 부분 참조 
                url: customApiUrl+"image",
                method: 'POST',
                headers: {
                    //PERFORMANCE 탭의 Prediction URL 에서 Prediction-Key 참조 
                    "prediction-key": customApiKey
                },
                processData: false,
                contentType: false,
                data: formData,
                dataType: 'text'
                
                }).done(function(data){
                    parseSuccessMessage(data);
                    document.getElementById('fileForm').reset();

                })
                .fail(function(data){
                    //alert("error");
                    parseErrorMessage(data);
            });
        }        
    });
});


function parseSuccessMessage(data) {
    var object = JSON.parse(data);
    var percentValue = object.Predictions[0].Probability;
    var noodleValue = object.Predictions[0].Tag;
    if (percentValue > 0.9) {
        percentValue = percentValue * 100;
        $('#percent').append(percentValue);
        $('#noodleName').append(noodleValue);

        var resultMessage = '<h1>' + noodleValue + '일 확률이 ' + percentValue + '% 정도 됩니다!</h1>';
        document.getElementById('resultContainer').innerHTML = resultMessage;
    }
    else if (percentValue > 0.5) {
        percentValue = percentValue * 100;
        $('#percent').append(percentValue);
        $('#noodleName').append(noodleValue);

        var resultMessage = '<h1>확실하진 않지만... ' + noodleValue + '일 확률이 ' + percentValue + '% 정도 됩니다!</h1>';
        document.getElementById('resultContainer').innerHTML = resultMessage;
    }
    else {
        var exceptionMessage = '<h1>이거 냉면사진 맞아요? 아닌것 같은데...</h1>'
        document.getElementById('resultContainer').innerHTML = exceptionMessage;
    }
}

function connectToAzureStroage(file){
    
    var fileName = file.name;
    var uriValue = inputStorageUrl+fileName+storageSAS;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": uriValue,
        "method": "PUT",
        "headers": {
            "x-ms-blob-type": "BlockBlob",           
        },
        "data": file,
        "processData": false
    }

    $.ajax(settings).done(function (response) {
        
        document.getElementById('fileForm').reset(); //Data Reset
    });
}


function parseErrorMessage(data){
    
    var temp = JSON.stringify(data);
    var object = JSON.parse(temp);

    var stateValue = object.readyState;
    var responseValue = JSON.parse(object.responseText);
    var errorCode = responseValue.Code;
}