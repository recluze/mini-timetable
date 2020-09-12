function make_alloc_box_id_str(day_name, room_name, slot_name){
     return day_name + "-" + room_name + "-" + slot_name; 
}

function make_day_heading(day_name) { 
    var day_div = document.createElement('div');
    day_div.innerHTML = day_name;
    day_div.className = 'day-heading';
    var cont = document.getElementById(main_container_id);
    cont.appendChild(day_div);
}

function make_room_row(room_name) { 
    var room_row = document.createElement('div');
    room_row.innerHTML = '<div class="room-heading">' + room_name + '</div>';
    room_row.className = 'row';
    var cont = document.getElementById(main_container_id);
    cont.appendChild(room_row);
    return room_row; 
}

function make_alloc_box(room_row, alloc_box_id) { 
    var alloc_div = document.createElement('div');
    // alloc_div.innerHTML = alloc_id;
    alloc_div.id = alloc_box_id; 
    alloc_div.className = 'col-xs-1 item target';
    
    // make inner divs 
    blank_symb = '.'; 
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

    room_row.appendChild(alloc_div);
}

function make_grid() { 
    day_list.forEach(function(day_item, day_index) { 
        // add day heading first 
        make_day_heading(day_item); 

        room_list.forEach(function(room_item, room_index) { 
            // add row and suffic it with room heading 
            // <div id="responsive-grid" class="row">
            var room_row = make_room_row(room_item);

            slot_list.forEach(function(slot_item, slot_index) { 
                // now create the alloc box 
                alloc_box_id = make_alloc_box_id_str(day_item, room_item, slot_item); 
                make_alloc_box(room_row, alloc_box_id); 
                // alert(alloc_id); 
            }); 
        }); 
    }); 

}



// Grid manipulation functions 
function shorten_course_name(course_name) { 
    if (course_name.length < max_course_name_length) 
        return course_name; 
    else { 
        short_name = ""; 
        words = course_name.split(" "); 
        for(var idx in words) { 
            this_word = words[idx]; 
            if (this_word == 'and')
                short_word = "&amp;"; 
            else 
                short_word = this_word.substring(0, 4); 
            short_name += short_word + " "; 
        }
        return short_name; 
    }
        
}

function find_alloc_box_for_alloc_id(target_alloc_id, set_to_blank = false) { 
    for (var day_name in window.data) {
        room_dict = window.data[day_name];
        for (var room_name in room_dict) {
            slot_dict = room_dict[room_name]; 
            for(var slot_name in slot_dict) { 
                alloc_box_id = make_alloc_box_id_str(day_name, room_name, slot_name)
                alloc_id = slot_dict[slot_name]['id']; 
                
                console.log("Checking: ", alloc_id); 
                if (alloc_id == target_alloc_id) { 
                    console.log("Found alloc_id: ", target_alloc_id, "in: ", alloc_box_id); 
                    if (set_to_blank) { 
                        console.log("Removing alloc_id from data."); 
                        slot_dict[slot_name]['id'] = ''; 
                    }
                    return alloc_box_id; 
                } 
            }
        }
    }
}

function split_alloc_box_id(alloc_box_id) { 
    return alloc_box_id.split("-")
}

function update_record_of_alloc_id(alloc_box_id, alloc_id) {
    // Only do this for non-empty alloc_id 
    if (alloc_id != '') { 
        // first remove alloc_id from whereever it was 
        old_alloc_box_id = find_alloc_box_for_alloc_id(alloc_id, true); 
        console.log(window.data);
        // then put it in the new place  
        console.log("Updating backend data for: ", alloc_box_id, alloc_id );

    
        alloc_box_id_parts = split_alloc_box_id(alloc_box_id); 
        day_name = alloc_box_id_parts[0];
        room_name = alloc_box_id_parts[1];
        slot_name = alloc_box_id_parts[2];
        console.log("Updating to:", day_name, room_name, slot_name); 
        if (!(day_name in window.data)) 
            window.data[day_name] = {}; 
        if (!(room_name in window.data[day_name]))
            window.data[day_name][room_name] = {}; 
        if (!(slot_name in window.data[day_name][room_name]))
            window.data[day_name][room_name][slot_name] = {}; 
        
        console.log(window.data[day_name][room_name]);
        window.data[day_name][room_name][slot_name]['id'] = alloc_id; 
        console.log(window.data);
    } 
}

function populate_alloc_box(alloc_box_id, alloc_id) { 
    console.log("Populating: ", alloc_box_id, "with", alloc_id)

    var target_box = document.getElementById(alloc_box_id);
    // alert(target_box.children.item(0).innerHTML);

    if (alloc_id == '') { 
        course_code = blank_symb;
        class_section = blank_symb;
        course_short_name = blank_symb;
        teacher_name = blank_symb;
    } else { 
        course_code = window.id_detail_mapping[alloc_id].course_code; 
        class_section = window.id_detail_mapping[alloc_id].class_section;
        course_name = window.id_detail_mapping[alloc_id].course_name;
        course_short_name = shorten_course_name(course_name); 
        teacher_name = window.id_detail_mapping[alloc_id].teacher_name;
    } 
    console.log(course_code, class_section, course_name, teacher_name);

    target_box.children.item(0).innerHTML = alloc_id;
    target_box.children.item(1).innerHTML = course_code;
    target_box.children.item(2).innerHTML = class_section;
    target_box.children.item(3).innerHTML = course_short_name;
    target_box.children.item(3).title = course_name;
    target_box.children.item(4).innerHTML = teacher_name;
}

function swap_alloc_boxes(source_box_id, target_box_id) { 
    source_box = document.getElementById(source_box_id); 
    target_box = document.getElementById(target_box_id);

    
    // change visual 
    source_alloc_id = source_box.children.item(0).innerHTML;  
    target_alloc_id = target_box.children.item(0).innerHTML;  
    console.log(source_box_id, target_alloc_id); 
    console.log(target_box_id, source_alloc_id); 

    populate_alloc_box(source_box_id, target_alloc_id); 
    populate_alloc_box(target_box_id, source_alloc_id); 

    // change backend data too! 
    update_record_of_alloc_id(source_box_id, target_alloc_id); 
    update_record_of_alloc_id(target_box_id, source_alloc_id); 
}





/* Event thandlers */ 
function box_click_handler(box_clicked) { 
    var clicked_box_id = $(box_clicked).attr('id'); // or var clickedBtnID = this.id
    console.log('Clicked on box: ' + clicked_box_id);
    // mark it as selected 
    

    if (window.started_swap_process) { 
        // We're swapping... 
        swap_source = $(".selected-general").attr('id');
        console.log("X:", swap_source, " <-> ", clicked_box_id); 
        swap_alloc_boxes(swap_source, clicked_box_id);  
        // now done swapping 
        $('#btn-swap').removeClass("btn-danger"); 
        $('#btn-swap').addClass("btn-primary"); 
        window.started_swap_process = false; 
        $(".item").removeClass("selected-general"); 
    } else { 
        // Just do a basic select 
        $(".item").removeClass("selected-general"); 
        $(box_clicked).addClass("selected-general");
    } 
}

function swap_button_click_handler() {
    // check if somethig is selected 
    if ($(".selected-general").length > 0) { 
        // save that we're swapping 
        console.log("Swap!"); 
        $('#btn-swap').removeClass("btn-primary"); 
        $('#btn-swap').addClass("btn-danger"); 
        window.started_swap_process = true; 
    }
}


function refresh_button_click_handler() {
    // remove all selected
    $(".item").removeClass("selected-general"); 

    // stop the swap process 
    $('#btn-swap').removeClass("btn-danger"); 
    $('#btn-swap').addClass("btn-primary"); 
    window.started_swap_process = false; 
}