import os 
import json 
import copy
import random

def calculate_fitness(data, cannot_fit_courses, app): 
    pass 

def place_in_slot(data, day, room, slot, alloc_id): 
    if day not in data: 
        data[day] = {} 
    
    if room not in data[day]: 
        data[day][room] = {} 
    
    if slot not in data[day][room]: 
        data[day][room][slot] = {'id': ''} 

    data[day][room][slot]['id'] = alloc_id



def get_class_day_room_slot(class_to_check, data, meta_data): 
    day_list = meta_data['days_list']
    room_list = meta_data['rooms_list']
    slot_timings = meta_data['slots_list']

    slot_list = ['slot' + str(i+1) for i in range(len(slot_timings))]

    for day in day_list: 
        for room in room_list: 
            for slot in slot_list: 
                try: 
                    if data[day][room][slot]['id'] == class_to_check: 
                        return day, room, slot 
                except KeyError: 
                    pass 
    return None 


def remove_slots_for_match(free_slots, match1, match2): 
    return [item for item in free_slots if not (match1 in item and match2 in item)]

def find_clash_free_slot(course_id, free_slots, data, all_clashes, meta_data, course_teacher_map, teacher_course_map, app): 
    room_list = meta_data['rooms_list']

    app.logger.info("Finding free slot for: " + str(course_id))
    course_id_clipped = course_id[0][:-2]
    # find all clashes for this course 
    # app.logger.info(free_slots)

    # app.logger.info("Course clashes: " + str(course_clashes))
    
    slots_available = free_slots[:]

    # TODO: Wednesday slot3 is for no one. We need to make this not hard coded 
    slots_available = remove_slots_for_match(slots_available, 'Wednesday', 'slot3')
    slots_available = remove_slots_for_match(slots_available, 'Friday', 'slot4')

    # TODO: remove stuff not matching something particular. e.g. not matching 'Lab' for CL courses 

    # remove from slots_available: same day as another class of same subject 
    suffix = '2' if course_id[0][-1] == '1' else '1' 
    class_to_check = course_id_clipped + "-" + suffix
    day_to_remove = get_class_day_room_slot(class_to_check, data, meta_data)
    if day_to_remove is not None: 
        # app.logger.info("Removing day from available slots: " + day_to_remove[0])
        slots_available = remove_slots_for_match(slots_available, day_to_remove[0], '')
        # app.logger.info(slots_available)

    # remove from slots_available: same slot as a teacher's slot 
    teacher_name = course_teacher_map[course_id[0]]
    all_teacher_courses = teacher_course_map[teacher_name]
    # app.logger.info("Removing slots for: " + str(all_teacher_courses))
    for course in all_teacher_courses: 
        slot_to_remove = get_class_day_room_slot(course, data, meta_data)
        # app.logger.info("Found slot to remove for " + course + " : " + str(slot_to_remove))
        if slot_to_remove is not None: 
            slots_available = remove_slots_for_match(slots_available, slot_to_remove[0], slot_to_remove[2])
            # app.logger.info(slots_available)

    # remove from slots_available: same slot as clashing courses 
    try: 
        course_clashes = all_clashes[course_id_clipped].keys()
        for clashing_course in course_clashes: 
            for suffix in '1', '2': 
                check_for_course = clashing_course + "-" + suffix 
                slot_to_remove = get_class_day_room_slot(check_for_course, data, meta_data)
                # app.logger.info("Found slot to remove for clashing course: " + check_for_course + " : " + str(slot_to_remove))
                if slot_to_remove is not None: 
                    slots_available = remove_slots_for_match(slots_available, slot_to_remove[0], slot_to_remove[2])
                    # app.logger.info(slots_available)
    except KeyError: 
        pass  # if no clash is found, we're good anyway! 

    # remove from slots_available: pick a random slot from the remaining 
    if len(slots_available) > 1: 
        app.logger.info("Picking random value from: " + str(len(slots_available)))
        slot_picked = random.choice(slots_available)
        app.logger.info("Picked: " + slot_picked)
        return slot_picked 
           
    # for lab courses, check if "next slot" is also free
    return None 

def fit_courses_to_slots(data, courses_to_fit, free_slots, all_clashes, meta_data, course_teacher_map, teacher_course_map, app): 
    app.logger.info("Fitting ... ") 
    app.logger.info(" - Number of courses: " + str(len(courses_to_fit)))
    app.logger.info(" - Number of slots: " + str(len(free_slots)))
    
    
    all_variations = []
    num_variations = 1
    for i in range(num_variations): 
        app.logger.info("========= Trying variation: " + str(i))
        temp_data = copy.deepcopy(data)

        cannot_fit_courses = [] 
        fit_map = {} 

        # go through each course. Find clash-free slot and place it there 
        for course_id in courses_to_fit: 
            slot_id = find_clash_free_slot(course_id, free_slots, temp_data, all_clashes, meta_data, course_teacher_map, teacher_course_map, app)
        
            if slot_id is None: 
                app.logger.info("Cannot fit course clash free ... ")
                cannot_fit_courses.append(course_id)

            else: 
                fit_map[course_id[0]] = slot_id   # full coure_id was (course_id, pref)
                # also update data for next course placement 
                day_part, room_part, slot_part = slot_id.split('-')
                place_in_slot(temp_data, day_part, room_part, slot_part, course_id[0])
                free_slots.remove(slot_id)
            

        # calcualte fitness of whole timetable after placing all courses 
        fitness = calculate_fitness(temp_data, cannot_fit_courses, app)
        all_variations.append({'cannot_fit': cannot_fit_courses, 'fit_map': fit_map, 'fitness': fitness})


    return all_variations[0] # TODO: return best one 




def get_teacher_maps(id_detail_mapping): 
    course_teacher_map = {} 
    teacher_course_map = {} 
    for course_id, details in id_detail_mapping.items(): 
        teacher_name = details['teacher_name']
        course_teacher_map[course_id] = teacher_name

        if teacher_name in teacher_course_map: 
            teacher_course_map[teacher_name].append(course_id)
        else: 
            teacher_course_map[teacher_name] = [course_id]
    return course_teacher_map, teacher_course_map





def get_course_slot_map(data, meta_data, app):
    # app.logger.info(meta_data.keys())
    day_list = meta_data['days_list']
    room_list = meta_data['rooms_list']
    slot_timings = meta_data['slots_list']
    
    # TODO: make this dynamic. We're currently hard coding to use only first 5 slots and days 
    slot_timings = slot_timings[:5]
    day_list = day_list[:5]

    slot_list = ['slot' + str(i+1) for i in range(len(slot_timings))]
    # app.logger.info(slot_list)

    course_slot_map = {} 
    free_slots = []
    
    for day in day_list: 
        for room in room_list: 
            for slot in slot_list: 
                try: 
                    
                    full_slot_name = day + "-" + room + "-" + slot
                    alloc_id = data[day][room][slot]['id']

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
    

    course_teacher_map, teacher_course_map = get_teacher_maps(id_detail_mapping)
    fit_map = fit_courses_to_slots(data, courses_to_place, free_slots, all_clashes, meta_data, course_teacher_map, teacher_course_map, app)

   
    if sanity_check(fit_map, app): 
        return json.dumps(fit_map)    
    else: 
        return '{error: Something went wrong! Sanity check failed!}'

  

def sanity_check(fit_map, app): 
    # app.logger.info(fit_map)
    courses_fit_map = fit_map['fit_map']

    slots = courses_fit_map.values() 
    app.logger.info("Total number of slots: " + str(len(slots)))
    app.logger.info("Couldn't fit: " + str(len(fit_map['cannot_fit'])))
    if len(slots) != len(set(slots)): 
        return False

    return True 