from flask import Flask, render_template, request, send_from_directory
import time 
import os 
import json 


from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import registerFont, registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont

from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import letter, A4

from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle

from reportlab.platypus import PageBreak

def set_fonts(): 
    # register fonts 
    registerFont(TTFont('FiraSans', 'FiraSans-Regular.ttf')) # Just some font imports
    registerFont(TTFont('FiraSansBold', 'FiraSans-Bold.ttf'))
    registerFont(TTFont('FiraSansItalic', 'FiraSans-Italic.ttf'))
    registerFont(TTFont('FiraSansBoldItalic', 'FiraSans-BoldItalic.ttf'))
    registerFontFamily('FiraSans', normal='FiraSans',bold='FiraSansBold', italic='FiraSansItalic')

    # registerFont(TTFont('Calibri-Bold', 'FiraSans-Regular'))
    # can.setFont('FiraSans', 10)


def shorten_course_name(course_name): 
    if len(course_name) < 40: 
        return course_name 
    
    else: 
        course_name = course_name.replace("and", "&")
        course_name = course_name.replace("English", "Eng")
        course_name = course_name.replace("Composition", "Comp")
        # course_name = course_name.replace("Comprehension", "Comp")
        course_name = course_name.replace("Technology", "Tech")
        course_name = course_name.replace("Technologies", "Tech")
        course_name = course_name.replace("Computer", "Comp")

        return course_name

def shorten_teacher_name(teacher_name): 
    if len(teacher_name) < 18: 
        return teacher_name 
    else: 
        teacher_name = teacher_name.replace("Muhammad ", "")
        teacher_name = teacher_name.replace("Mohammad ", "")
        return teacher_name


def draw_header(story): 
    style_normal = ParagraphStyle(
        name='Normal',
        fontName='FiraSans',
        fontSize=16,
        leading=24,
    )
    custom_header_text = "FAST NUCES - Peshawar Campus - <b>CS/SE Timetable V 2.0</b>"
    head = Paragraph("" + custom_header_text + "", style=style_normal)
    story.append(head) 


def generate_data_for_all_days(app, from_directory, timetable_name, filter_text): 
    # read data, meta_data and id_detail_mapping_filename
    data_filename = os.path.join(from_directory, timetable_name + "-data.json")
    id_detail_mapping_filename = os.path.join(from_directory, timetable_name + "-id_detail_mapping.json")
    meta_data_filename = os.path.join(from_directory, timetable_name + "-meta-data.json")

    with open(data_filename) as json_file:
        source_data = json.load(json_file)

    with open(id_detail_mapping_filename) as json_file:
        id_detail_mapping = json.load(json_file)

    with open(meta_data_filename) as json_file: 
        meta_data_details = json.load(json_file)

    day_list = meta_data_details['days_list'] 
    room_list = meta_data_details['rooms_list'] 
    slot_timings = meta_data_details['slots_list']
    slot_list = ['slot' + str(i+1) for i in range(len(slot_timings))]


    # prepare a 3D list. First dimension is days. Rows are rooms, colummns are slots 
    # first row in third dimension is 

    data = []

    # app.logger.info(day_list)
    # app.logger.info(room_list)
    # app.logger.info(slot_list)
    # app.logger.info(id_detail_mapping)

    style_normal = ParagraphStyle(
        name='Normal',
        fontName='FiraSans',
        fontSize=5,
    )
    style_mini = ParagraphStyle(
        name='Normal',
        fontName='FiraSans',
        alignment=TA_RIGHT,
        fontSize=5,
    )
    style_mini_centered = ParagraphStyle(
        name='Normal',
        fontName='FiraSans',
        fontSize=5,
        alignment=TA_CENTER,
        leading=10
    )

    # add timing header 
    day_header = ['']
    for slot_timing in slot_timings: 
        timing_para = Paragraph(slot_timing, style=style_mini_centered)
        day_header.append(timing_para)

    
    for day in day_list: 
        day_data = []     
        day_data.append(day_header)
        for room in room_list: 
            room_data = [] 
            room_para = Paragraph(room, style=style_mini)
            room_data.append(room_para)
            found_some_slot = False
            for slot in slot_list: 
                # room_data.append(slot)
                
                try: 
                    alloc_id = source_data[day][room][slot]['id']
                except KeyError: 
                    alloc_id = ''

                if (alloc_id != ''): 
                    detailed_mapping = id_detail_mapping[alloc_id]
                    teacher_name = detailed_mapping['teacher_name']
                    teacher_name = shorten_teacher_name(teacher_name)
                    course_code = detailed_mapping['course_code']
                    class_section = detailed_mapping['class_section']
                    course_name = detailed_mapping['course_name']
                    course_name = shorten_course_name(course_name)

                    alloc_id = alloc_id[:-2]
                    slot_details = course_code + " " + class_section + "&nbsp;&nbsp;&nbsp; [" + teacher_name + "]<br/><b>" + course_name + "</b>"
    
                else: 
                    slot_details = ''

        
                # filter_text only has effect if it is set. We do it like this because we want to avoid 
                # filling the tables with blank cells 
                if (filter_text == '' and ' ' in slot_details) or (filter_text != '' and filter_text in slot_details): 
                    found_some_slot = True 
                    room_data.append(Paragraph(slot_details, style=style_normal))
                else: 
                    room_data.append(Paragraph('', style=style_normal))

            # omit rows which don't have anything scheudled 
            if found_some_slot: 
                day_data.append(room_data)
        data.append(day_data)
    # app.logger.info(data)
    return data, day_list


def generate_pdf_output(output_directory, filename, data, day_list, app): 
    pdf_filename = os.path.join(output_directory, filename)
    lWidth, lHeight = A4  # page size 
    merge_pages = 1 # 4
    page_size_landscape = (lHeight, lWidth*merge_pages)

    lightBlue = colors.Color(red=(215.0/255),green=(235.0/255),blue=(255.0/255))
    lightGray = colors.Color(red=(250.0/255),green=(250.0/255),blue=(250.0/255))

    c = SimpleDocTemplate(pdf_filename, pagesize=page_size_landscape, topMargin=0.25*inch, 
                                bottomMargin=0.25*inch, leftMargin=0.5*inch, rightMargin=0.5*inch)
    # set_fonts(c)

    story = []
    draw_header(story)

    # app.logger.info(data)
    # data= [['00', '01', '02', '03', '04'],
    #  ['10', '11', '12', '13', '14'],
    #  ['20', '21', '22', '23', '24'],
    #  ['30', '31', '32', '33', '34']]
    style_day_head = ParagraphStyle(
        name='Bold',
        fontName='FiraSans',
        fontSize=12,
        leading=20,
        alignment=TA_CENTER
    )

    


    for day_data, day_name in zip(data, day_list): 
        day_name_para = Paragraph("<br /><b>" + day_name + "</b>", style=style_day_head)
        day_name_para.keepWithNext = True
        story.append(day_name_para)


        timetable_style = [
                                ('BACKGROUND',(0,0),(0,-1), lightBlue),
                                ('BACKGROUND',(0,0),(-1,0), lightBlue),
                                # ('TEXTCOLOR',(0,0),(1,-1), colors.red), 
                                ('FONTNAME', (0,-1), (0,-1), 'FiraSans'),
                                ('FONTSIZE', (0, 0), (-1,-1), 5),
                                ('BOX', (0,0), (-1,-1), 0.25, colors.black),
                                ('INNERGRID', (0, 0), (-1, -1), 0.25, colors.black)
                            ]

        first_row = True 
        for i, row in enumerate(day_data):
            if first_row: 
                first_row = False 
                continue 

            if i % 2 == 0:
                timetable_style.append(('BACKGROUND',(1,i),(-1,i), colors.white))
            else:
                timetable_style.append(('BACKGROUND',(1,i),(-1,i), lightGray))


        t = Table(day_data, colWidths=[0.7*inch] + [1.5*inch] * 7,  repeatRows=1)

        t.setStyle(TableStyle(timetable_style))

        
        story.append(t)

    c.build(story)

    return 



def export_timetable(timetable_name, filter_text, app): 
    set_fonts() # need to do this first since paragraph creation needs it 

    from_directory = os.path.join(app.instance_path, app.config['UPLOAD_FOLDER'])
    output_directory = os.path.join(from_directory, "output_pdfs")
    timestamp = time.strftime("%Y-%m-%d-%H%M%S")
    exported_filename = timetable_name + "-" + timestamp + ".pdf"
    app.logger.info("Exporting to PDF: " + exported_filename)

    data, day_list = generate_data_for_all_days(app, from_directory, timetable_name, filter_text)
    generate_pdf_output(output_directory, exported_filename, data, day_list, app) 

    app.logger.info("Exporting PDF file from:" + from_directory)
    return send_from_directory(output_directory, exported_filename)


    