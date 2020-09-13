function make_alloc_box_id_str(day_name, room_name, slot_name){
     return day_name + "-" + room_name + "-" + slot_name; 
}

function make_day_heading(day_name) { 
    var day_div = document.createElement('div');
    day_div.innerHTML = day_name;
    day_div.className = 'day-heading';
    var cont = document.getElementById(main_container_id);
    cont.appendChild(day_div);

    // also add the slot timings 
    var slot_headings_row = document.createElement('div');
    slot_headings_row.innerHTML = '<div class="room-heading slot-blank-room">&nbsp;</div>';
    slot_headings_row.className = 'row';
    var cont = document.getElementById(main_container_id);
    // repeat for slots 
    for (var idx in window.slot_timings) { 
        timing = window.slot_timings[idx]; 

        var slot_div = document.createElement('div'); 
        slot_div.className = 'col-xs-1 item timings';
        slot_div.innerHTML = timing;
        slot_headings_row.appendChild(slot_div); 
    }

    cont.appendChild(slot_headings_row); 
}

function make_room_row(room_name, alt_bg) { 
    var room_row = document.createElement('div');
    room_row.innerHTML = '<div class="room-heading">' + room_name + '</div>';

    var bg_class = alt_bg ? ' row-alt-bg' : '' 
    room_row.className = 'row' + bg_class;
    var cont = document.getElementById(main_container_id);
    cont.appendChild(room_row);
    return room_row; 
}

function make_alloc_box(room_row, alloc_box_id) { 
    var alloc_div = document.createElement('div');
    // alloc_div.innerHTML = alloc_id;
    alloc_div.id = alloc_box_id; 
    alloc_div.className = 'col-xs-1 item shallower target';
    
    // make inner divs 
    blank_symb = '&middot;'; 
    in_div = document.createElement('div');
    in_div.innerHTML = '';  // must leave blank for empty ones 
    in_div.className = 'alloc_id';
    alloc_div.appendChild(in_div);
    in_div = document.createElement('div');
    in_div.innerHTML = blank_symb;
    in_div.className = 'course-code';
    alloc_div.appendChild(in_div);
    in_div = document.createElement('div');
    in_div.innerHTML = blank_symb;
    in_div.className = 'class-section';
    alloc_div.appendChild(in_div);
    in_div = document.createElement('div');
    in_div.innerHTML = blank_symb;
    in_div.className = 'course-name';
    alloc_div.appendChild(in_div);
    in_div = document.createElement('div');
    in_div.innerHTML = blank_symb;
    in_div.className = 'teacher-name';
    alloc_div.appendChild(in_div);

    // badge for clash count 
    in_div = document.createElement('span');
    in_div.innerHTML = '55';
    in_div.className = 'badge badge-danger clash-count';
    alloc_div.appendChild(in_div);

    room_row.appendChild(alloc_div);
}

function make_grid() { 
    day_list.forEach(function(day_item, day_index) { 
        // add day heading first 
        make_day_heading(day_item); 
        var alt_bg = false; 
        room_list.forEach(function(room_item, room_index) { 
            // add row and suffic it with room heading 
            // <div id="responsive-grid" class="row">

            var room_row = make_room_row(room_item, alt_bg);
            alt_bg = alt_bg ? false : true;   // toggle alternating background 

            slot_list.forEach(function(slot_item, slot_index) { 
                // now create the alloc box 
                alloc_box_id = make_alloc_box_id_str(day_item, room_item, slot_item); 
                make_alloc_box(room_row, alloc_box_id); 
                // alert(alloc_id); 
            }); 
        }); 
    }); 

}

function initial_populate_with_all_data() { 
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
    find_all_remaining_alloc_ids(); 
}













/* temporary only */ 

function gen_data() {
    window.data = {
        'Monday': {
            'Room6': {
                'slot1': { id: 'EE213-BCS-3B-1' }
            },
            'HallA': {
                'slot2': { id: 'CS101-BCS-1A-1' }
            }
        }
    };

    window.id_detail_mapping = {
        'EE213-BCS-3B-1': {
            "course_code": "EE213",
            "class_section": "BCS-3B",
            "course_name": "Computer Architecture and Assembly Language",
            "teacher_name": "Dr. Nauman"
        },
        'CS101-BCS-1A-1': {
            "course_code": "CS101",
            "class_section": "BCS-1A",
            "course_name": "Programming Fundamentals",
            "teacher_name": "Waqas Ali"
        },
        'CS101-BCS-1A-2': {
            "course_code": "CS101",
            "class_section": "BCS-1A",
            "course_name": "Programming Fundamentals",
            "teacher_name": "Waqas Ali"
        },
        'CS218-BCS-5A-1': {
            "course_code": "CS218",
            "class_section": "BCS-5A",
            "course_name": "Data Structures",
            "teacher_name": "Osama Sohrab"
        },
        'CS218-BCS-5A-2': {
            "course_code": "CS218",
            "class_section": "BCS-5A",
            "course_name": "Data Structures",
            "teacher_name": "Osama Sohrab"
        },
    };

    window.student_to_course_map = { 
        '20P-0001' : ['CS218-BCS-5A', 'CS101-BCS-1A']
    }

    window.course_to_student_map = { 
        'CS218-BCS-5A': ['20P-0001']
    }

    initial_populate_with_all_data();

}