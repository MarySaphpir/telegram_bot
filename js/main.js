$(document).ready(function () {
    $(".start-btn").on('click', function (e) {
        e.preventDefault();
        $.ajax({
            url: 'pages/start-page.html',
            success: function (result) {
                $('.pages').html(result);
                console.log(result);
            }
        });
    });

});