// some settings 
// TODO: need to load these dynamically from server 
main_container_id = "main-container";
started_swap_process = false;

day_list = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
room_list = ['MehboobLab', 'KhyberLab', 'AbidiLab', 'Room6', 'Room8', 'Room9', 'Room10', 'Room11', 'Room12', 'HallA', 'HallB'];
slot_list = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'slot7'];
slot_timings = ['8.00 - 9.30', '9.30 - 11.00', '11.00 - 12.30', '12.30 - 2.00', '2.00 - 3.30', '3.30 - 5.00', '5.00 - 6.30'] 

all_ramaining_alloc_ids = []

max_course_name_length = 20;

data = {} 
id_detail_mapping = {} 
student_to_course_map = {} 
course_to_student_map = {} 

//  some imports 
$.getScript("assets/gridmaker.js", function () { });
// $.getScript("assets/uifunctions.js", function() {});



/* jQuery Connectors */
$(function () {

    // setup some dummy data to play with 
    make_grid();
    gen_data();

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