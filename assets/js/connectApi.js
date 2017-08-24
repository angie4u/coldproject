
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
    var uriValue = "https://noodleprojectstorage.blob.core.windows.net/input/"+fileName+"?st=2017-08-15T16%3A06%3A00Z&se=2017-09-16T16%3A06%3A00Z&sp=rwdl&sv=2015-12-11&sr=c&sig=2kJwPvdo3YbyTknIevcXn2Q%2FgP7GhBHsujK4jEAJZzk%3D";

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
        //console.log(response);
        //Azure Storage에 이미지 데이터 전송 완료
        document.getElementById('fileForm').reset(); //Data Reset
    });
}


function parseErrorMessage(data){
    
    var temp = JSON.stringify(data);
    //var errorMessage = object.
    var object = JSON.parse(temp);

    var stateValue = object.readyState;
    var responseValue = JSON.parse(object.responseText);
    var errorCode = responseValue.Code;

    if(errorCode=="BadRequestImageSizeBytes")
    {
        //이미지 크기가 큰 경우         
        if (confirm('이미지가 너무 큽니다.. 이미지 줄여서 전송할까요?')) {
            
            //1. Azure Function 호출하여 이미지 리사이즈
            connectToAzureStroage(file);

            //2. 리사이즈 된 이미지 주소 전달하여 호출  
            var resizedImageUrl = "";

            $.ajax({
                //PERFORMANCE 탭의 Prediction URL 에서 상단의 image URL 부분 참조 
                url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/d5913d73-8da0-46d4-be1d-17d7fd45f888/inline/url',
                method: 'POST',
                headers: {
                    //PERFORMANCE 탭의 Prediction URL 에서 Prediction-Key 참조 
                    "prediction-key": "b11fa5d5345147968406c8f3b638ec4a",
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



        } else {
            // Do nothing!
            var resultMessage = "<h1>이미지가 너무 커서 업로드에 실패했습니다...</h1>";
            document.getElementById('resultContainer').innerHTML = resultMessage;
        }
    }
    
}

$(document).ready(function () {
    $('#goBtn').click(function () {
        $.ajax({
            //PERFORMANCE 탭의 Prediction URL 에서 상단의 image URL 부분 참조 
            url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/d5913d73-8da0-46d4-be1d-17d7fd45f888/inline/url',
            method: 'POST',
            headers: {
                //PERFORMANCE 탭의 Prediction URL 에서 Prediction-Key 참조 
                "prediction-key": "b11fa5d5345147968406c8f3b638ec4a",
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
    $('#sendBtn').click(function () {
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
                var resizedImageUrl = "https://noodleprojectstorage.blob.core.windows.net/images-thumbnail/"+fileData.name;

                $.ajax({
                    //PERFORMANCE 탭의 Prediction URL 에서 상단의 image URL 부분 참조 
                    url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/e1381295-16e1-4073-9ea9-c9585e8ffe10/url',
                    method: 'POST',
                    headers: {
                        //PERFORMANCE 탭의 Prediction URL 에서 Prediction-Key 참조 
                        "prediction-key": "79ea46b6255542e285abd8d1be7249fe",
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

            }


            
            
        }
        else{
            $.ajax({
                //PERFORMANCE 탭의 Prediction URL 에서 하단의 image file 부분 참조 
                url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/d5913d73-8da0-46d4-be1d-17d7fd45f888/inline/image',
                method: 'POST',
                headers: {
                    //PERFORMANCE 탭의 Prediction URL 에서 Prediction-Key 참조 
                    "prediction-key": "b11fa5d5345147968406c8f3b638ec4a"
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
