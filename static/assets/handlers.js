/* Event thandlers */ 
function update_event_handlers() { 
    $(".remaining-selected").click(function () {
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


function remaining_selected_click_handler(item_clicked) { 
    var alloc_id_lbl = $(item_clicked).text(); 
    alloc_id = alloc_id_lbl.split(' ')[0];
    alloc_id = alloc_id.substring(0, alloc_id.length-2);  
    console.log("Selecting alloc_id for scheduling: ", alloc_id); 
    $("#alloc-id-selected").html(alloc_id_lbl); 
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


function check_clash_handler() { 
    console.log("Checking clash...");
    $("#Monday-Room6-slot1").addClass('in-clash-teacher');
    $("#Monday-HallA-slot2").addClass('in-clash-student');
    $("#Monday-HallA-slot2 .clash-count").show();
}


