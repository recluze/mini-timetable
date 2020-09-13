function find_all_remaining_alloc_ids() { 
    // reset it 
    window.all_remaining_alloc_ids = []; 
    all_allocated_ids = []; 
    // go through all the ones in data 
    for (var day_name in window.data) {
        room_dict = window.data[day_name];
        for (var room_name in room_dict) {
            slot_dict = room_dict[room_name]; 
            for(var slot_name in slot_dict) { 
                alloc_box_id = make_alloc_box_id_str(day_name, room_name, slot_name)
                all_allocated_ids.push(slot_dict[slot_name]['id']); 
            }
        }
    }
    console.log("Following have been done:", all_allocated_ids); 

    // go through all the ones in id_detail_mapping and remove ones in data 
    for (var alloc_id in window.id_detail_mapping) { 
        if (!(all_allocated_ids.includes(alloc_id))) { 
            all_details = window.id_detail_mapping[alloc_id]; 
            course_name = all_details['course_name']; 
            teacher_name = all_details['teacher_name']; 
            suffix = " [" + course_name + "] " + teacher_name; 
            alloc_id_extended = alloc_id + suffix; 
            all_remaining_alloc_ids.push(alloc_id_extended); 
        }
    } 
    console.log("Following remain: ", window.all_remaining_alloc_ids);     
    populate_nav_dropdown_remaining_allocs();
}


function populate_nav_dropdown_remaining_allocs() { 
    // first remoce all children 
    $("#search-leftover-dropdown ul li").remove(); 
    var search_ul = $("#search-leftover-dropdown ul"); 
    // console.log(dropdown_ul.attr('class')); 

    // then add from window.all_remaining_alloc_ids 
    for (var idx in window.all_remaining_alloc_ids) {
        alloc_id = window.all_remaining_alloc_ids[idx]; 
        console.log(alloc_id); 

        var alloc_li = document.createElement('li');
        alloc_li.innerHTML = "<a href='#' class='remaining-selected'>"+alloc_id+"</a>";
        search_ul.append(alloc_li);
    } 
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
                
                // console.log("Checking: ", alloc_id); 
                if (alloc_id == target_alloc_id) { 
                    // console.log("Found alloc_id: ", target_alloc_id, "in: ", alloc_box_id); 
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
        course_name = blank_symb;
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

