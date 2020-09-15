from flask import Flask, render_template, request, send_from_directory
import time 
import os 


from reportlab.pdfgen import canvas



def generate_pdf_output(output_directory, filename, app): 
    c = canvas.Canvas(os.path.join(output_directory, filename))
    c.drawString(100,100,"Hello World")
    c.showPage()    
    c.save 
    return 



def export_timetable(timetable_name, app): 
    from_directory = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
    timestamp = time.strftime("%Y-%m-%d-%H%M%S")
    exported_filename = timetable_name + "-" + timestamp + ".pdf"
    app.logger.info("Exporting to PDF: " + exported_filename)

    generate_pdf_output(from_directory, exported_filename, app) 

    app.logger.info("Exporting PDF file from:" + from_directory)
    return send_from_directory(from_directory, exported_filename)


    