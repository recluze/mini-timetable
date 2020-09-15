/* Event thandlers */ 
function update_event_handlers() { 
    $(".remaining-selected").click(function (e) {
        e.preventDefault(); 
        remaining_selected_click_handler(this); 
    });
}
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

    // clear filter box stuff 
    $("#filter-box").val(''); 
    
    $(".in-clash-teacher").removeClass('in-clash-teacher'); 
    $(".in-clash-student").removeClass('in-clash-student'); 

    // remove badges 
    $('.clash-count').text(''); 
    $('.clash-count').hide(); 

    highlight_filter_box_term(); 
}

function highlight_filter_box_term() { 
    $(".highlight-filter-box").removeClass("highlight-filter-box"); 

    var term = $("#filter-box").val().toLowerCase();
    if(term == "") return; 

    console.log("Highlighting for", term);

    var all_allocs_to_highlight = []; 

    // go through window.id_detail_mapping and find based on contains string. Collect alloc_ids 
    for (var alloc_id in window.id_detail_mapping) { 
        all_details = window.id_detail_mapping[alloc_id]; 
        str_details = JSON.stringify(all_details).toLowerCase();
        // console.log(str_details); 
        if (str_details.includes(term)) { 
            all_allocs_to_highlight.push(alloc_id)
        }
    }
    console.log("Found on filter: ", all_allocs_to_highlight); 

    // find where those alloc_ids are and mark them as filter-highlight 
    for (var idx in all_allocs_to_highlight) { 
        alloc_id = all_allocs_to_highlight[idx]; 

        console.log("Trying to find for highlight: ", alloc_id); 
        alloc_box_id = find_alloc_box_for_alloc_id(alloc_id); 
        // console.log(alloc_box_id); 
        if (alloc_box_id) { 
            $("#" + alloc_box_id).addClass("highlight-filter-box"); 
        }
    }
}

function highlight_student_filter_box_term() { 
    $(".highlight-student-filter-box").removeClass("highlight-student-filter-box"); 
    var term = $("#student-filter-box").val().toUpperCase();
    if(term == "") return; 

    console.log("Searching for student:", term); 
    
    if (term in window.student_to_course_map) { 
        student_courses = window.student_to_course_map[term]['courses']; 
        
        for (var course_idx in student_courses) { 
            alloc_id = student_courses[course_idx];
            variants = [alloc_id + "-1", alloc_id + "-2"]; 

            for (var idx in variants) { 
                alloc_id_x = variants[idx]; 

                alloc_box_id = find_alloc_box_for_alloc_id(alloc_id_x); 
                if (alloc_box_id == ''){ 
                    continue; 
                }
                $('#' + alloc_box_id).addClass('highlight-student-filter-box'); 
            }
        }
    }

}


function remaining_selected_click_handler(item_clicked) { 
    // unselect whatever was selected 
    $('.selected-general').removeClass('selected-general'); 
    var alloc_id_lbl = $(item_clicked).text(); 
    alloc_id = alloc_id_lbl.split(' ')[0];
    // alloc_id = alloc_id.substring(0, alloc_id.length-2);  
    console.log("Selecting alloc_id for scheduling: ", alloc_id); 
    $("#alloc-id-selected").html(alloc_id_lbl); 
    check_clashes_for(alloc_id); 
}

function insert_from_remaining_handler() { 
    // first check if something is selected from remaining 
    var alloc_id_lbl = $("#alloc-id-selected").text();
    if (alloc_id_lbl == '') { 
        alert("Please select a remaining card."); 
    }
    alloc_id = alloc_id_lbl.split(' ')[0];
    console.log("Placing:", alloc_id);  

    // ensure some slot is selected 
    target_alloc_box_id = $(".selected-general").attr('id');
    if (target_alloc_box_id == null) { 
        alert("Please select a slot to place card in."); 
        return; 
    }

    console.log("Placing in: ", target_alloc_box_id); 
    // update GUI 
    populate_alloc_box(target_alloc_box_id, alloc_id); 
    // make sure you also update backend data 
    update_record_of_alloc_id(target_alloc_box_id, alloc_id);  
    // also update the remaining list 
    find_all_remaining_alloc_ids(); 
    // clear out the label as well 
    $("#alloc-id-selected").html(''); 
    
    update_event_handlers(); 
}


function remove_selected_handler() { 
    if ($(".selected-general").length > 0) { 
        // get the ID of whatever is selected 
        remove_source = $(".selected-general").attr('id');
        remove_selected_alloc_box(remove_source); 
    }
}

function load_timetable(timetable_name) {
    console.log("Loading timetable: " + timetable_name); 
    
    $.ajax({
        type: "GET",
        url: '/load_timetable',
        data: {'timetable_name': timetable_name}, 
        success: function (data) {
            response = $.parseJSON(data);
            // console.log(response); 
            console.log(response); 
            window.timetable_name = response['timetable_name'];
            window.data = response['data']; 
            window.id_detail_mapping = response['id_detail_mapping'];
            window.student_to_course_map = response['student_to_course_map'];
            window.course_to_student_map = response['course_to_student_map'];
            window.all_clashes = response['clash_details'];

            window.day_list = response['day_list'];
            window.room_list = response['room_list'];
            window.slot_list = response['slot_list'];
            window.slot_timings = response['slot_timings'];

            console.log("Loaded timetable data!"); 

            // let's refresh UI 
            make_grid(); 
            initial_populate_with_all_data(); 
            update_event_handlers(); 

        }
    });
    $('#modal-load-timetable').modal('hide'); 
}

function check_clash_handler() { 
    console.log("Checking clash...");
    // $("#Monday-Room6-slot1").addClass('in-clash-teacher');
    // $("#Monday-HallA-slot2").addClass('in-clash-student');
    // $("#Monday-HallA-slot2 .clash-count").show();

    if ($(".selected-general").length > 0) { 
        alloc_box_id = $(".selected-general").attr('id'); 
        alloc_id = get_alloc_id_from_box_id(alloc_box_id); 
        check_clashes_for(alloc_id); 
    } 
    
}


