from flask import Flask, request
from flask import render_template 
import os 
import json 

from pytt.controller import perform_initial_setup
from pytt.controller import load_timetable_data_details
from pytt.controller import save_timetable_details

from pytt.preferences import make_preferences_page
from pytt.export import export_timetable
from pytt.generation import suggest_slots_for_level

from flask.logging import default_handler


app = Flask(__name__, 
        static_url_path='', 
        static_folder='static')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['UPLOAD_FOLDER'] = 'uploaded'

@app.route('/')
def timetable_page():
    return render_template('index.html') 


@app.route('/set_preferences', methods = ['GET', 'POST'])
def set_preferences():
    timetable_name = request.args.get('timetable_name', '')
    if timetable_name == '': 
        return 'Need a timetable name...'
    return make_preferences_page(timetable_name, request.form, app)

@app.route('/suggest_slots') 
def suggest_slots(): 
    timetable_name = request.args.get('timetable_name', '')
    level = request.args.get('level', '')
    if timetable_name == '': 
        return "{error: 'Need a timetable name...'}" 

    return suggest_slots_for_level(timetable_name, level, app)

@app.route('/export')
def export(): 
    timetable_name = request.args.get('timetable_name')
    filter_text = request.args.get('filter_text', '')
    return export_timetable(timetable_name, filter_text, app) 

@app.route('/new_timetable', methods = ['GET', 'POST'])
def new_timetable_request():
    timetable_name = request.form['txt_timetable_name']

    if request.method == 'POST':  
        if 'file_offered_courses' in request.files: 
            courses_file = request.files['file_offered_courses']  
            courses_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-v0-offered-courses.csv")
            if os.path.exists(courses_filename): 
                return 'Error. It seems this timetable name is already in use. Pick another.'
                
            courses_file.save(courses_filename)  
            app.logger.info("File saved in:" + courses_filename)
        else: 
            return 'Error. Please provide offered courses file.'

        if 'file_registered_students' in request.files: 
            students_file = request.files['file_registered_students']  
            students_filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], timetable_name + "-v0-registered-students.csv")
            students_file.save(students_filename)  
            app.logger.info("File saved in:" + students_filename)
        else: 
            return 'Error. Please provide offered courses file.'

        # process uploads and create SQLite files based on this new timetable         

        timetable_name = request.form['txt_timetable_name']
        merge_list = request.form['txt_merge_list']
        days_list = request.form['txt_day_list']
        rooms_list = request.form['txt_room_list']
        slots_list = request.form['txt_slot_list']

        return perform_initial_setup(app, timetable_name, courses_filename, students_filename, merge_list, days_list, rooms_list, slots_list)



@app.route('/get_timetables_list')
def get_timetables_list():
    import glob, datetime
    dir_to_search = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])

    all_timetables = []
    for name in glob.glob(dir_to_search + '/*-meta-data.json'):
        mod_date = os.stat(name).st_mtime
        mod_date = datetime.datetime.fromtimestamp(mod_date).strftime('%Y-%m-%d %H:%M:%S')

        this_timetable_name = os.path.basename(name)
        this_timetable_name = this_timetable_name[:-1*len("-meta-data.json")]
        app.logger.info(this_timetable_name)

        this_entry = {'name': this_timetable_name, 'modified_date': mod_date} 
        all_timetables.append(this_entry)
    return json.dumps(all_timetables)


@app.route('/load_timetable')
def load_timetable():
    timetable_name = request.args.get('timetable_name') 

    app.logger.info("Loading timetable data for: " + timetable_name )
    
    return load_timetable_data_details(app, timetable_name)




@app.route('/save_timetable', methods = ['GET', 'POST'])
def save_timetable():
    name_to_save = request.form['timetable_name']
    app.logger.info("Saving timetable:" + name_to_save) 
    return save_timetable_details(app, name_to_save, request.form)