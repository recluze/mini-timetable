function process_suggestion_place_button(btn) { 
    alloc_id = $(btn).parent().siblings().eq(0).text()
    alloc_box_id = $(btn).parent().siblings().eq(1).text()

    console.log("Placing: ", alloc_id, " in ", alloc_box_id);
    // update GUI 
    populate_alloc_box(alloc_box_id, alloc_id); 
    // make sure you also update backend data 
    update_record_of_alloc_id(alloc_box_id, alloc_id);  
    // also update the remaining list 
    find_all_remaining_alloc_ids(); 

    // remove this row since it's placed 
    // btn -> td -> tr 
    $(btn).parent().parent().remove(); 
}

function populate_suggestions_box(response) { 
    fit_map = response['fit_map']; 
    // console.log(fit_map);

    for (var alloc_id in fit_map) { 
        alloc_box_id = fit_map[alloc_id]
        console.log(alloc_id, alloc_box_id)

        in_tr = document.createElement('tr');
        in_tr.className = 'suggestion-tr'

        in_td = document.createElement('td');
        in_td.className = 'normal-td'; 
        in_td.innerHTML = alloc_id
        in_tr.appendChild(in_td);

        in_td = document.createElement('td');
        in_td.className = 'normal-td'; 
        in_td.innerHTML = alloc_box_id
        in_tr.appendChild(in_td);

        in_td = document.createElement('td');
        in_td.className = 'normal-td'; 
        in_td.innerHTML = '<a class="btn btn-secondary btn-sm btn-place" href="#" role="button"><i class="fas fa-angle-double-down"></i></a>'
        in_tr.appendChild(in_td);
        var cont = document.getElementById('suggestions-table');
        cont.appendChild(in_tr);

        
    } 
    // create jQuery handlers 
    $(".btn-place").click(function (e) {
        e.preventDefault(); 
        process_suggestion_place_button(this)
    });

    // <tr>
    //             <td class='normal-td'>CL117-Blah</td>
    //             <td class='normal-td'>Monday-MehboobLab-slot6</td>
    //             <td><a class="btn btn-secondary btn-sm btn-place" href="#" role="button"><i
    //                         class="fas fa-angle-double-down"></i></a></td>
    //         </tr>
}

function get_automated_suggestions() { 
    console.log("Will show suggestions box .... "); 
    $("#top-loading-text").show(); 
    $(".suggestion-tr").remove(); // remove old suggestions 

    timetable_name = window.timetable_name
    if (timetable_name == ''){ 
        $("#top-loading-text").hide(); 
        return; 
    }

    level = $("#suggest-placement-box").val(); 
    console.log("Will get suggestions for:", timetable_name, " level: ", level)
    if (level == '') { 
        $("#top-loading-text").hide(); 
        alert("Please enter level ... "); 
        return; 
    }

    // do the ajax request 
    $.ajax({
        type: "GET",
        url: '/suggest_slots',
        data: {timetable_name: timetable_name, level: level},
        success: function (data) {
            response = $.parseJSON(data);
            // console.log(response); 
            populate_suggestions_box(response)
            // end the loading thingy after showing the box 
            $("#suggestion-container").show(); 
            $("#suggestion-container").css('z-index', 99999999);
            $("#suggestion-container").css('position', 'absolute');
            $("#top-loading-text").hide(); 
        }
    }); 
}