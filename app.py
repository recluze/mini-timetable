from flask import Flask
from flask import render_template 

app = Flask(__name__, 
        static_url_path='', 
        static_folder='static')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route('/')
def hello_world():
    return render_template('index.html') 

