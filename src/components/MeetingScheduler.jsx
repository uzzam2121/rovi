import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Edit2, Check, X } from 'lucide-react';
import { getSessionData, updateSessionData } from '../utils/dataStorage';

export default function MeetingScheduler() {
  const [meetings, setMeetings] = useState(() => getSessionData().meetings);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  // Sync with storage changes
  useEffect(() => {
    const handleDataChange = (e) => {
      const data = e.detail || getSessionData();
      if (data.meetings) {
        setMeetings(data.meetings);
      }
    };

    window.addEventListener('rovi:sessionDataChanged', handleDataChange);
    return () => {
      window.removeEventListener('rovi:sessionDataChanged', handleDataChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg shadow-md p-6 flex flex-col text-white border border-yellow-600/30"
      style={{ background: 'linear-gradient(135deg, #0f4c75 0%, #1b5e7a 100%)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5" />
        <h3 className="font-semibold text-lg">Upcoming Meetings</h3>
      </div>
      <div className="space-y-2">
        {meetings.map((meeting, index) => {
          const isEditing = editingId === meeting.id;
          const currentEditData = isEditing && editData ? editData : { ...meeting, participantsText: meeting.participants.join(', ') };

          const handleEdit = () => {
            setEditData({ ...meeting, participantsText: meeting.participants.join(', ') });
            setEditingId(meeting.id);
          };

          const handleSave = () => {
            const updated = {
              ...currentEditData,
              participants: currentEditData.participantsText.split(',').map(p => p.trim()).filter(p => p)
            };
            const newMeetings = meetings.map(m => m.id === meeting.id ? updated : m);
            setMeetings(newMeetings);
            // Save to storage
            updateSessionData({ meetings: newMeetings });
            setEditingId(null);
            setEditData(null);
          };

          const handleCancel = () => {
            setEditingId(null);
            setEditData(null);
          };

          return (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-l-4 border-white/50 pl-3 py-1.5 hover:bg-white/10 rounded-r transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={currentEditData.title}
                        onChange={(e) => setEditData({ ...currentEditData, title: e.target.value })}
                        className="w-full px-2 py-1 bg-white/20 text-white rounded text-sm font-medium"
                        placeholder="Meeting title"
                      />
                      <input
                        type="text"
                        value={currentEditData.time}
                        onChange={(e) => setEditData({ ...currentEditData, time: e.target.value })}
                        className="w-full px-2 py-1 bg-white/20 text-white rounded text-sm"
                        placeholder="Time (e.g., 09:00)"
                      />
                      <input
                        type="text"
                        value={currentEditData.participantsText}
                        onChange={(e) => setEditData({ ...currentEditData, participantsText: e.target.value })}
                        className="w-full px-2 py-1 bg-white/20 text-white rounded text-sm"
                        placeholder="Participants (comma separated)"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={handleSave}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 rounded text-xs flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-xs flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{meeting.title}</h4>
                        <button
                          onClick={handleEdit}
                          className="p-0.5 hover:bg-white/20 rounded transition-colors"
                          title="Edit meeting"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-xs opacity-90">
                          <Clock className="w-3 h-3" />
                          <span>{meeting.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-90">
                          <Users className="w-3 h-3" />
                          <span>{meeting.participants.length}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {meeting.participants.map((participant, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-white/20 text-white rounded-full text-xs"
                          >
                            {participant}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
