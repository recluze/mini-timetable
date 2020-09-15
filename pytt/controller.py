import csv
import os 
import json 

def join_code_section(course_code, class_section): 
    return course_code + "-" + class_section

def create_student_to_course_map(app, students_filename): 
    all_mappings = {} 

    with open(students_filename) as csv_file:
        all_mappings = {} 

        csv_reader = csv.reader(csv_file, delimiter=',')
        first_row = True  # to skip first row 

        for row in csv_reader:
            # first row is header 
            if first_row: 
                first_row = False 
                continue 

            student_id = row[2]
            student_name = row[3]
            course_code = row[4]
            class_section = row[7]
            
            course_identifier = join_code_section(course_code, class_section)
        
            if student_id not in all_mappings: 
                all_mappings[student_id] = {'student_name': student_name}  # initialize only once 
                student_courses_list = [] 
            else: 
                student_courses_list = all_mappings[student_id]['courses']

            student_courses_list.append(course_identifier)
            all_mappings[student_id]['courses'] = student_courses_list

            #break 
    app.logger.info(all_mappings)
    return json.dumps(all_mappings) 


def create_course_to_student_map(app, students_filename): 
    all_mappings = {} 

    with open(students_filename) as csv_file:
        all_mappings = {} 

        csv_reader = csv.reader(csv_file, delimiter=',')
        first_row = True  # to skip first row 

        for row in csv_reader:
            # first row is header 
            if first_row: 
                first_row = False 
                continue 

            student_id = row[2]
            student_name = row[3]
            course_code = row[4]
            class_section = row[7]
            
            course_identifier = join_code_section(course_code, class_section)
        
            if course_identifier not in all_mappings: 
                all_mappings[course_identifier] = [] # initialize only once 
                course_students_list = [] 
            else: 
                course_students_list = all_mappings[course_identifier]

            course_students_list.append(student_id)
            all_mappings[course_identifier] = course_students_list

            #break 
    # app.logger.info(all_mappings)
    return json.dumps(all_mappings) 


def create_course_clashes_details(app, course_to_student_mapping): 
    all_clashes = {} 

    for course_ident_1, all_students_c1 in course_to_student_mapping.items(): 
        for course_ident_2, all_students_c2 in course_to_student_mapping.items(): 
            if course_ident_1 == course_ident_2: 
                continue # don't check clash with self 

            clash_students = [student_id for student_id in all_students_c1 if student_id in all_students_c2]
            if len(clash_students) == 0: 
                continue 

            if course_ident_1 not in all_clashes: 
                all_clashes[course_ident_1] = {} 
             
            all_clashes[course_ident_1][course_ident_2] = clash_students 
    return json.dumps(all_clashes) 

def create_id_detail_mapping(app, courses_filename): 
    # 1. code   2. Title 4. Teacher Name  5. Sectionn  
    with open(courses_filename) as csv_file:
        all_mappings = {} 

        csv_reader = csv.reader(csv_file, delimiter=',')
        first_row = True  # to skip first row 

        for row in csv_reader:

            # first row is header 
            if first_row: 
                first_row = False 
                continue 
            
            course_code = row[1]
            course_name = row[2]
            teacher_name = row[4]
            class_section = row[5]

            this_mapping = {} 
            this_mapping['course_code'] = course_code 
            this_mapping['class_section'] = class_section 
            this_mapping['course_name'] = course_name 
            this_mapping['teacher_name'] = teacher_name 

            this_id = join_code_section(course_code, class_section) 
            all_mappings[this_id + "-1"] = this_mapping 
            all_mappings[this_id + "-2"] = this_mapping 
            
            
    
        # app.logger.info(all_mappings)
        return json.dumps(all_mappings) 

def perform_initial_setup(app, timetable_name, courses_filename, students_filename, days_list, rooms_list, slots_list): 
    app.logger.info(timetable_name + " - " + courses_filename + " - " + students_filename + 
                        " [" + days_list + "] [" + rooms_list + "] [" + slots_list + "]")

    # create blank data 
    data_contents = {} 
    data_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-data.json")
    with open(data_filename, 'w') as file: 
        file.write(data_contents)

    # create the required id_detail_mapping, student_to_course_map and course_to_student_map
    id_detail_mapping_contents = create_id_detail_mapping(app, courses_filename)
    id_detail_mapping_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-v0-id_detail_mapping.json")
    with open(id_detail_mapping_filename, 'w') as file: 
        file.write(id_detail_mapping_contents)

    # student_to_course_map 
    student_to_course_map = create_student_to_course_map(app, students_filename)
    student_to_course_map_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-v0-student_course_map.json")
    with open(student_to_course_map_filename, 'w') as file: 
        file.write(student_to_course_map)

    # course_to_student_map 
    course_to_student_map = create_course_to_student_map(app, students_filename)
    course_to_student_map_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-v0-course_student_map.json")
    with open(course_to_student_map_filename, 'w') as file: 
        file.write(course_to_student_map)


    # find clashes 
    clash_details = create_course_clashes_details(app, json.loads(course_to_student_map)) 
    clash_details_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-v0-clash_details.json")
    with open(clash_details_filename, 'w') as file: 
        file.write(clash_details)

    # TODO: REMOVE! only doing this for dev time 
    os.remove(courses_filename)
    os.remove(students_filename)

    return "Done. You may now load this timetable's V0"




def load_timetable_data_details(app, timetable_name): 
    current_version = timetable_name[timetable_name.rfind('v')+1:]
    # TODO: load latest variant of the current version 

    data_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-data.json")
    id_detail_mapping_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-id_detail_mapping.json")
    student_to_course_map_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-student_course_map.json")
    course_to_student_map_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-course_student_map.json")
    clash_details_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-clash_details.json")


    with open(data_filename) as json_file:
        data = json.load(json_file)

    with open(id_detail_mapping_filename) as json_file:
        id_detail_mapping = json.load(json_file)

    with open(student_to_course_map_filename) as json_file:
        student_to_course_map = json.load(json_file)
    
    with open(course_to_student_map_filename) as json_file:
        course_to_student_map = json.load(json_file)

    with open(clash_details_filename) as json_file:
        clash_details = json.load(json_file)


    # TODO: Fix this. Why is this hard coded. Save when it comes in from the form for new timetable 
    day_list = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    room_list = ['MehboobLab', 'KhyberLab', 'AbidiLab', 'Room5', 'Room6', 'Room8', 'Room9', 'Room10', 'Room11', 'Room12', 'HallA', 'HallB', 'CallLab', 'CommLab'];
    slot_list = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'slot7'];
    slot_timings = ['8.00 - 9.30', '9.30 - 11.00', '11.00 - 12.30', '12.30 - 2.00', '2.00 - 3.30', '3.30 - 5.00', '5.00 - 6.30'] 



    all_data = {} 
    all_data['timetable_name'] = timetable_name 
    all_data['data'] = data 
    all_data['id_detail_mapping'] = id_detail_mapping
    all_data['student_to_course_map'] = student_to_course_map
    all_data['course_to_student_map'] = course_to_student_map
    all_data['clash_details'] = clash_details
    all_data['day_list'] = day_list 
    all_data['room_list'] = room_list 
    all_data['slot_list'] = slot_list 
    all_data['slot_timings'] = slot_timings 

    
    all_data = json.dumps(all_data)
    # app.logger.info(all_data)
    app.logger.info(current_version)
    return all_data


def save_timetable_details(app, timetable_name, all_data): 
    # app.logger.info(all_data)

    data_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-data.json")
    id_detail_mapping_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-id_detail_mapping.json")
    student_to_course_map_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-student_course_map.json")
    course_to_student_map_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-course_student_map.json")
    clash_details_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-clash_details.json")

    app.logger.info(id_detail_mapping_filename)
    data = all_data['alloc_data']
    id_detail_mapping = all_data['id_detail_mapping']
    student_to_course_map = all_data['student_to_course_map']
    course_to_student_map = all_data['course_to_student_map']
    clash_details = all_data['all_clashes']

    with open(data_filename, 'w') as file: 
        file.write(data)

    return json.dumps({'success': True})