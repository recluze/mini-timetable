from flask import Flask, render_template, request
import json 
import os 

def make_preferences_page(timetable_name, form, app): 
    from_directory = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
    id_detail_mapping_filename = os.path.join(from_directory, timetable_name + "-id_detail_mapping.json")
    gen_preferences_filename = os.path.join(from_directory, timetable_name + "-gen_preferences.json")

    with open(id_detail_mapping_filename) as json_file:
        id_detail_mapping = json.load(json_file)

    all_courses = [key[:-2] for key in id_detail_mapping.keys()]
    all_courses = list(set(all_courses))
    all_courses.sort() 



    # if form has been submitted, we need to save it 
    if form: 
        app.logger.info("Saving submitted form ... ") 
        pref_dict = {} 
        pref_dict['course_prefs'] = {} 

        for course_id in all_courses: 
            pref_dict['course_prefs'][course_id] = form['txt_' + course_id]

        with open(gen_preferences_filename, 'w') as file: 
            file.write(json.dumps(pref_dict))
            
            
        
            
        # return json.dumps(form)





    # in either case, show the form .... with saved data 
    try: 
        with open(gen_preferences_filename) as json_file:
            pref_dict = json.load(json_file)
    except FileNotFoundError: 
            pref_dict = {}  

    # app.logger.info(all_courses)
    try: 
        course_prefs = pref_dict['course_prefs']
    except KeyError: 
        course_prefs = {} 

    course_details = [] 
    for course_id in all_courses: 
        if course_id in course_prefs: 
            this_course_pref = course_prefs[course_id]
        else: 
            this_course_pref = 3 

        this_course_name = course_id + " - " + id_detail_mapping[course_id + "-1"]['course_name']
        course_details.append((course_id, this_course_name, this_course_pref))
    

    return render_template('preferences.html', course_details=course_details) 
    