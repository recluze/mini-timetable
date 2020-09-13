// some settings 
// TODO: need to load these dynamically from server 
main_container_id = "main-container";
started_swap_process = false;

day_list = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
room_list = ['MehboobLab', 'KhyberLab', 'AbidiLab', 'Room6', 'Room8', 'Room9', 'Room10', 'Room11', 'Room12', 'HallA', 'HallB'];
slot_list = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'slot7'];
slot_timings = ['8.00 - 9.30', '9.30 - 11.00', '11.00 - 12.30', '12.30 - 2.00', '2.00 - 3.30', '3.30 - 5.00', '5.00 - 6.30'] 

all_ramaining_alloc_ids = []

max_course_name_length = 20;

// data from the backend. Everything other than data is read only 
timetable_name = ''
data = {} 
id_detail_mapping = {} 
student_to_course_map = {} 
course_to_student_map = {} 
all_clashes = {} 