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

    $("#btn-check-clash").click(function () {
        check_clash_handler(); 
    });
    


    // update all dynamic event handlers 
    update_event_handlers(); 
    
});