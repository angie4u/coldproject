
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

function parseErrorMessage(data){
    var object = JSON.stringify(data);
    //var errorMessage = object.

    var stateValue = object.readyState;
    var responseCode = object.responseText.Code;
    
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
                parseJson(data);
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
    });
});
