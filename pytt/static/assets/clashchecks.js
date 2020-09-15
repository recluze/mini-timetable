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