/* jQuery Connectors */
$(function () {

    // setup some dummy data to play with 
    // make_grid();
    // gen_data();

    // set up on click listeners 
    $(document).on("click", ".target", function () {
        // var clickedBtnID = $(this).attr('class'); // or var clickedBtnID = this.id
        // alert('you clicked on button #' + clickedBtnID);
        box_click_handler(this);
    });
    // swap function click handler 
    $('#btn-swap').click(function () {
        // $(this).find('i.fa-heart').css('color', '#f7296a');
        swap_button_click_handler();
    });
    $('#btn-refresh').click(function () {
        // $(this).find('i.fa-heart').css('color', '#f7296a');
        refresh_button_click_handler();
    });


    // setup the rest of the UI 
    $("#search-leftover-courses-box").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $(".dropdown-menu li").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $("#filter-box").keyup(function () {
        highlight_filter_box_term();
    });

    $("#btn-insert").click(function () {
        insert_from_remaining_handler();
    });

    $("#btn-remove").click(function () {
        remove_selected_handler();
    });

    $("#btn-check-clash").click(function () {
        check_clash_handler();
    });

    $("#btn-actions-new-timetable").click(function () {
        $('#modal-new-timetable').modal();
    });
    $("#btn-actions-load-timetable").click(function () {
        $('#modal-load-timetable').modal();
    });

    $('#modal-load-timetable').on('shown.bs.modal', function (e) {
        console.log("Loading past timetables"); 
        // remove past records 
        $("#load-timetables-list").find("tr:gt(0)").remove(); 

        // now load afresh 
        $.ajax({
            type: "GET",
            url: '/get_timetables_list',
            success: function (data) {
                response = $.parseJSON(data);
                console.log(response); 
                $(function() {
                    $.each(response, function(i, item) {
                        var $tr = $('<tr>').append(
                            $('<td>').text(item.name),
                            $('<td>').text(item.modified_date),
                            $('<td>').append( 
                                $('<button/>', {
                                    text: 'Load', 
                                    class: 'btn btn-sm btn-danger',
                                    click: function() { load_timetable(item.name); }
                                }) 
                            )
                        ); //.appendTo('#records_table');
                        // console.log($tr.wrap('<p>').html());
                        $("#load-timetables-list").append($tr); 
                    });
                });
            }
        });
    }); 
    /*
    $("#frm-new-timetable").submit(function (event) {
        event.preventDefault();

        var form = $(this);
        var url = form.attr('action');

        var form_data = form; // .serialize();
        form_data.append('file_offered_courses', $('#file_offered_courses')[0].files[0]);

        $.ajax({
            type: "POST",
            url: url,
            data: form_data, 
            success: function (data) {
                alert(data); 
            }
        });

    });
    */ 


    // update all dynamic event handlers 
    update_event_handlers();

});