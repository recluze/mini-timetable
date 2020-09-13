from flask import Flask, request
from flask import render_template 
import os 
import json 

from pytt.controller import perform_initial_setup
from pytt.controller import load_timetable_data_details


from flask.logging import default_handler


app = Flask(__name__, 
        static_url_path='', 
        static_folder='static')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['UPLOAD_FOLDER'] = 'uploaded'

@app.route('/')
def hello_world():
    return render_template('index.html') 


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
        days_list = request.form['txt_day_list']
        rooms_list = request.form['txt_room_list']
        slots_list = request.form['txt_slot_list']

        return perform_initial_setup(app, timetable_name, courses_filename, students_filename, days_list, rooms_list, slots_list)



@app.route('/get_timetables_list')
def get_timetables_list():
    return json.dumps([
        {'name': 'Fall-2020-v0', 'modified_date': 'x'}
    ])


@app.route('/load_timetable')
def load_timetable():
    timetable_name = request.args.get('timetable_name') 

    app.logger.info("Loading timetable data for: " + timetable_name )
    
    return load_timetable_data_details(app, timetable_name)
