function clash_count_badge_click_handler(btn) { 
    console.log("Showing clashing students ..."); 
    alloc_id = $(btn).siblings().eq(0).text(); 
    alloc_id = alloc_id.substring(0, alloc_id.length - 2);
    all_students_in_clash = window.all_clashes[window.current_clashes_highlighted_for][alloc_id]; 

    var cont = document.getElementById('clash-students-list');
    $(".clash-student-tr").remove(); // remove previous list 

    for (var idx in all_students_in_clash) { 
        student_id = all_students_in_clash[idx]; 
        student_name = window.student_to_course_map[student_id]['student_name']; 

        // console.log("Showing Student:", student_id, student_name);

        in_tr = document.createElement('tr');
        in_tr.className = 'clash-student-tr'

        in_td = document.createElement('td');
        in_td.innerHTML = student_id
        in_tr.appendChild(in_td);

        in_td = document.createElement('td');
        in_td.innerHTML = student_name;
        in_tr.appendChild(in_td);

        cont.appendChild(in_tr);
    }

    $("#clash-students-box").modal('show');


}

function highlight_for_student_clash(alloc_id, clash_students) { 
    variants = [alloc_id + "-1", alloc_id + "-2"]; 
    clash_count = clash_students.length 

    for (var idx in variants) { 
        alloc_id_x = variants[idx]; 

        alloc_box_id = find_alloc_box_for_alloc_id(alloc_id_x); 
        if (alloc_box_id == ''){ 
            continue; 
        }
        console.log("Marking in clash student", alloc_box_id); 
        $('#' + alloc_box_id).addClass('in-clash-student'); 
        $('#' + alloc_box_id + " .clash-count").text(clash_count); 
        $('#' + alloc_box_id + " .clash-count").show(); 

        $('#' + alloc_box_id + " .clash-count").click(function (e) {
            e.preventDefault(); 
            e.stopPropagation(); // do not do click of parent 
            clash_count_badge_click_handler(this); 
        });
    }
}


function check_teacher_clash(alloc_id) { 
    // get teacher_name 
    teacher_name = window.id_detail_mapping[alloc_id+"-1"]['teacher_name']; 
    console.log("Teacher clash for:", teacher_name); 

    // find all subjects with this teacher 
    all_allocs_for_teacher = [] 
    for (var this_alloc_id in window.id_detail_mapping) { 
        // console.log("For alloc_id", this_alloc_id); 
        this_teacher_name = window.id_detail_mapping[this_alloc_id]['teacher_name'];
        if (this_teacher_name == teacher_name) { 
            all_allocs_for_teacher.push(this_alloc_id); 
        }
    } 
    console.log(all_allocs_for_teacher); 

    // highlight both variants of each of these subjects 
    for (var idx in all_allocs_for_teacher) { 
        this_alloc_id = all_allocs_for_teacher[idx];    
        alloc_box_id = find_alloc_box_for_alloc_id(this_alloc_id); 
        if (alloc_box_id == ''){ 
            continue; 
        }
        console.log("Marking in clash teacher", alloc_box_id); 
        $('#' + alloc_box_id).addClass('in-clash-teacher');            
    }
}

function check_clashes_for(alloc_id) { 
    // clear existing clashes 
    $(".in-clash-student").removeClass("in-clash-student"); 
    $(".in-clash-teacher").removeClass("in-clash-teacher"); 
    $('.clash-count').text(''); 
    $('.clash-count').hide(); 

    // remove the suffix 
    alloc_id = alloc_id.substring(0, alloc_id.length - 2)
    console.log("Checking clashes for: ", alloc_id); 
    window.current_clashes_highlighted_for = alloc_id;    // Need this for students in badge click 
    
    // get clashes from all_clashes 
    clash_dict = window.all_clashes[alloc_id]; 
    // console.log(clash_dict)

    for (var idx in clash_dict) { 
        clash_students = clash_dict[idx]; 
        clash_count = clash_students.length 

        // console.log("In clash with: ", idx, " [" + clash_count + "]");
        highlight_for_student_clash(idx, clash_students); 
    }

    // now check teacher clashes as well 
    check_teacher_clash(alloc_id) 
}



function perform_all_chashes_check() { 
    $(".highlight-all-clashes").removeClass("highlight-all-clashes"); 
    $(".highlight-same-slot-teacher").removeClass("highlight-same-slot-teacher"); 

    // go through all slots. If the slot in question has any clash in Day+Slot combo, highlight it. 
    console.log("Starting check for all clashes ...");
    for (var day_name in window.data) {
        room_dict = window.data[day_name];
        for (var room_name in room_dict) {
            slot_dict = room_dict[room_name]; 
            for(var slot_name in slot_dict) { 
                alloc_box_id = make_alloc_box_id_str(day_name, room_name, slot_name)
                alloc_id = slot_dict[slot_name]['id']; 
                
                if (alloc_id == ''){ 
                    continue; // nothing allocated in this slot 
                }

                teacher_name = window.id_detail_mapping[alloc_id]['teacher_name'];

                alloc_id = alloc_id.substring(0, alloc_id.length - 2);
                
                // console.log("Checking clashes for:", alloc_id, " in", alloc_box_id, " and teacher: ", teacher_name);
                // first get clashes for this alloc_id 
               
                if (!(alloc_id in window.all_clashes)) { 
                    console.log("Hnn, this guy does not have any clashes at all!", alloc_id); 
                }

                all_clashes_to_check = window.all_clashes[alloc_id]; 

                for (var room_name_to_check in room_dict) {                    
                    // my goodness! n^4 complexity! Good thing n is pretty small in even the largest of cases 

                    // not looping over slots. We only need to check slot_id 
                    slot_dict_to_check = room_dict[room_name_to_check]; 

                    // we can skip if this slot isn't reserved at all 
                    if (slot_name in slot_dict_to_check) { 
                        alloc_id_to_check = slot_dict_to_check[slot_name]['id']; 
                        if (alloc_id_to_check == ''){  
                            // or maybe we have the key but is now blank because it was moved 
                            continue; // nothing allocated in this slot 
                        }

                        // console.log("Checking if in clash:", alloc_id_to_check);

                        teacher_name_to_check = window.id_detail_mapping[alloc_id_to_check]['teacher_name'];

                        alloc_id_to_check = alloc_id_to_check.substring(0, alloc_id_to_check.length - 2);
                        
                        if (alloc_id_to_check in all_clashes_to_check) { 
                            $("#" + alloc_box_id).addClass("highlight-all-clashes"); 
                            // break; // still need to check the rest of the rooms for teacher clash 
                        }

                        // teacher check 
                        if ((alloc_id != alloc_id_to_check) && (teacher_name_to_check == teacher_name)) { 
                            console.log("Same teacher in:" + alloc_box_id + " and for:" + alloc_id_to_check)
                            $("#" + alloc_box_id).addClass("highlight-same-slot-teacher"); 
                        }
                    }
                }
            }
        }
    }
}