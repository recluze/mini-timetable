import os 
import json 
import copy

def calculate_fitness(data, cannot_fit_courses, app): 
    pass 

def check_if_room_in_clash(data, course_clashes, day, room, slot, app): 
    try: 
        subject_in_room = data[day][room][slot]['id'][:-2]  # clip away the 
        if subject_in_room in course_clashes: 
            app.logger.info(" .. in clash")
            return True 
        else: 
            return False
    except KeyError: 
        return False # since nothing in data for this slot, we're ok 

        
def find_clash_free_slot(course_id, free_slots, data, all_clashes, meta_data, app): 
    room_list = meta_data['rooms_list']

    app.logger.info("Finding free slot for: " + str(course_id))
    course_id_clipped = course_id[0][:-2]
    # find all clashes for this course 
    # app.logger.info(free_slots)
    course_clashes = list(all_clashes[course_id_clipped].keys())
    app.logger.info("Course clashes: " + str(course_clashes))
    

    # TODO: fix this. We're currently hard coding no placement in Wed 11.00 clock slot. We can define this as custom rules  
    # for each 

    # pick first free slot, see if it will lead to clash if so, pick next, repeat 
    for free_slot in free_slots: 
        is_slot_ok = True 

        try_day, try_room, try_slot = free_slot.split('-')
        app.logger.info("Trying slot:" + ' '.join([try_day, try_room, try_slot]))
        # check all rooms in this slot 

        for check_room in room_list: 
            app.logger.info("Checking room for clash:" + check_room)
            if check_if_room_in_clash(data, course_clashes, try_day, check_room, try_slot, app): 
                is_slot_ok = False 
                break # no need to check further 

        if is_slot_ok: 
            return free_slot 
           
    # for lab courses, check if "next slot" is also free
    return None 

def fit_courses_to_slots(data, courses_to_fit, free_slots, all_clashes, meta_data, app): 
    app.logger.info("Fitting ... ") 
    app.logger.info(" - Number of courses: " + str(len(courses_to_fit)))
    app.logger.info(" - Number of slot: " + str(len(free_slots)))
    

    
    all_variations = []
    num_variations = 1
    for i in range(num_variations): 
        app.logger.info("========= Trying variation: " + str(i))
        temp_data = copy.deepcopy(data)

        cannot_fit_courses = [] 
        fit_map = {} 

        # go through each course. Find clash-free slot and place it there 
        for course_id in courses_to_fit: 
            slot_id = find_clash_free_slot(course_id, free_slots, temp_data, all_clashes, meta_data, app)
        
            if slot_id is None: 
                app.logger.info("Cannot fit course clash free ... ")
                cannot_fit_courses.append(course_id)

            else: 
                fit_map[course_id[0]] = slot_id   # full coure_id was (course_id, pref)
                # also update data for next course placement 
                day_part, room_part, slot_part = slot_id.split('-')
                temp_data[day_part][room_part][slot_part]['id'] = course_id[0]
                free_slots.remove(slot_id)
            

        # calcualte fitness of whole timetable after placing all courses 
        fitness = calculate_fitness(temp_data, cannot_fit_courses, app)
        all_variations.append({'cannot_fit': cannot_fit_courses, 'fit_map': fit_map, 'fitness': fitness})


    return all_variations[0] # TODO: return best one 




def get_course_slot_map(data, meta_data, app):
    app.logger.info(meta_data.keys())
    day_list = meta_data['days_list']
    room_list = meta_data['rooms_list']
    slot_timings = meta_data['slots_list']
    
    # TODO: make this dynamic. We're currently hard coding to use only first 5 slots and days 
    slot_timings = slot_timings[:5]
    day_list = day_list[:5]

    slot_list = ['slot' + str(i+1) for i in range(len(slot_timings))]
    app.logger.info(slot_list)

    course_slot_map = {} 
    free_slots = []
    
    for day in day_list: 
        for room in room_list: 
            for slot in slot_list: 
                try: 
                    alloc_id = data[day][room][slot]['id']
                    full_slot_name = day + "-" + room + "-" + slot

                    if alloc_id == '': 
                        free_slots.append(full_slot_name) # it's free, just record that 
                        continue

                    course_slot_map[alloc_id] = full_slot_name
                    # app.logger.info(alloc_id + ": " + full_slot_name) 
                except KeyError: 
                    free_slots.append(full_slot_name) # it's free, just record that 

    return course_slot_map, free_slots


def suggest_slots_for_level(timetable_name, level, app): 
    # load data of already assigned ones 
    from_directory = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
    id_detail_mapping_filename = os.path.join(from_directory, timetable_name + "-id_detail_mapping.json")
    all_clashes_filename = os.path.join(from_directory, timetable_name + "-clash_details.json")
    data_filename = os.path.join(from_directory, timetable_name + "-data.json")
    meta_data_filename = os.path.join(from_directory, timetable_name + "-meta-data.json")
    preferences_filename = os.path.join(from_directory, timetable_name + "-gen_preferences.json")


    with open(id_detail_mapping_filename) as json_file:
        id_detail_mapping = json.load(json_file)
    with open(all_clashes_filename) as json_file:
        all_clashes = json.load(json_file)
    with open(data_filename) as json_file:
        data = json.load(json_file)
    with open(meta_data_filename) as json_file:
        meta_data = json.load(json_file)
    with open(preferences_filename) as json_file:
        preferences = json.load(json_file)

    # find out done courses so we don't worry about them 
    course_slot_map, free_slots = get_course_slot_map(data, meta_data, app)
    

    # loop through all the subjects that are the correct priority level (or higher) and collect them 
    # filter out the ones which are already done 
    courses_to_place = [] 
    for course_id, pref_level in preferences['course_prefs'].items(): 
        if pref_level >= level: 
            course_id_suffix_1 = course_id + "-1"
            course_id_suffix_2 = course_id + "-2"

            if course_id_suffix_1 not in course_slot_map: 
                courses_to_place.append((course_id_suffix_1, pref_level))
            if course_id_suffix_2 not in course_slot_map: 
                courses_to_place.append((course_id_suffix_2, pref_level))
    

    fit_map = fit_courses_to_slots(data, courses_to_place, free_slots, all_clashes, meta_data, app)

    app.logger.info(fit_map)
    return json.dumps(fit_map)