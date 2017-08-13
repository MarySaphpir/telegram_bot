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
    $('#icon_telephone').keypress(function(e) {
        if (e.which != 8 && e.which != 0 && e.which != 46 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });
});