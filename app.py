# from flask import Flask, request
# from flask import render_template 
# import os 

# from flask.logging import default_handler


# app = Flask(__name__, 
#         static_url_path='', 
#         static_folder='static')
# app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
# app.config['UPLOAD_FOLDER'] = 'uploaded'

# @app.route('/')
# def hello_world():
#     return render_template('index.html') 


# @app.route('/new_timetable', methods = ['GET', 'POST'])
# def new_timetable_request():
#     if request.method == 'POST':  
#         if 'file_offered_courses' in request.files: 
#             courses_file = request.files['file_offered_courses']  
#             filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], courses_file.filename)
#             courses_file.save(filename)  
#             app.logger.info("File saved in:" + filename)
#         else: 
#             return 'Error. Please provide offered courses file.'

#         if 'file_registered_students' in request.files: 
#             students_file = request.files['file_registered_students']  
#             filename = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'], students_file.filename)
#             students_file.save(filename)  
#             app.logger.info("File saved in:" + filename)
#         else: 
#             return 'Error. Please provide offered courses file.'

#         # process uploads and create SQLite files based on this new timetable         

#         return "Done!"

