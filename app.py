from flask import Flask, request
from flask import render_template 
import os 

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
    if request.method == 'POST':  
        courses_file = request.files['file_offered_courses']  

        if courses_file: 
            filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], courses_file.filename)
            courses_file.save(filename)  
            app.logger.info("File saved in:", filename)

        return "yay!"

