// some settings 
// TODO: need to load these dynamically from server 
main_container_id = "main-container"; 
started_swap_process = false; 

day_list = ['Monday', 'Tuesday', 'Wednesday'];
room_list = ['Room1', 'HallA'] ;
slot_list = ['slot1', 'slot2', 'slot3'];

max_course_name_length = 25; 

//  some imports 
$.getScript("assets/gridmaker.js", function() {});
// $.getScript("assets/uifunctions.js", function() {});




// scratchpad 

function gen_data() {    
    window.data = { 
        'Monday': { 
            'Room1': {
                'slot1': { id : 1 }
            }, 
            'HallA': { 
                'slot2': { id : 2 }
            }
        }
    }; 

    window.id_detail_mapping = { 
        1 : { 
            "course_code": "EE213", 
            "class_section": "BCS-3B", 
            "course_name": "Computer Architecture and Assembly Language", 
            "teacher_name": "Dr. Nauman"
        }, 
        3 : { 
            "course_code": "CS101", 
            "class_section": "BCS-1A", 
            "course_name": "Programming Fundamentals", 
            "teacher_name": "Waqas Ali"
        }, 
        2 : { 
            "course_code": "CS101", 
            "class_section": "BCS-1A", 
            "course_name": "Programming Fundamentals", 
            "teacher_name": "Waqas Ali"
        }, 
    };

    
    for (var day_name in window.data) {
        room_dict = window.data[day_name];
        for (var room_name in room_dict) {
            slot_dict = room_dict[room_name]; 
            for(var slot_name in slot_dict) { 
                alloc_box_id = make_alloc_box_id_str(day_name, room_name, slot_name)
                alloc_id = slot_dict[slot_name]['id']; 
                // console.log(alloc_box_id, alloc_id); 
                populate_alloc_box(alloc_box_id, alloc_id);
            }
        }
    }

}



/* jQuery Connectors */ 
$(function () {

    // setup some dummy data to play with 
    make_grid(); 
    gen_data(); 

    // populate_alloc_box('Monday-Room-1-slot2', 2);
    swap_alloc_boxes('Monday-Room1-slot1', 'Monday-HallA-slot2'); 
    
    // set up on click listeners 
    $(document).on("click", ".target", function () {
        // var clickedBtnID = $(this).attr('class'); // or var clickedBtnID = this.id
        // alert('you clicked on button #' + clickedBtnID);
        box_click_handler(this); 
    });
    // swap function click handler 
    $('#btn-swap').click(function(){
        // $(this).find('i.fa-heart').css('color', '#f7296a');
        swap_button_click_handler();
    });
    $('#btn-refresh').click(function(){
        // $(this).find('i.fa-heart').css('color', '#f7296a');
        refresh_button_click_handler();
    });
});