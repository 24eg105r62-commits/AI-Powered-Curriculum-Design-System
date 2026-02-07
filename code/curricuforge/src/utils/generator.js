export const generateCurriculum = (config) => {
    const {
        grades, // Number of grades (e.g., 10)
        sectionsPerGrade, // Number (e.g., 2)
        subjects, // Array of strings
        teachers, // Array of strings
        classesPerDay, // Number (e.g., 8)
        lunchSlot, // Number (1-based index)
    } = config;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const fullCurriculum = [];

    // Track teacher availability: teacherName -> day -> slot -> boolean (true if busy)
    const teacherSchedule = {};
    teachers.forEach(t => {
        teacherSchedule[t] = Array(5).fill(null).map(() => Array(classesPerDay).fill(false));
    });

    // Helper to get a random item
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Helper to check availability
    const isTeacherAvailable = (teacher, dayIdx, slotIdx) => {
        if (!teacherSchedule[teacher]) return true; // Should not happen
        return !teacherSchedule[teacher][dayIdx][slotIdx];
    };

    for (let g = 1; g <= grades; g++) {
        for (let s = 1; s <= sectionsPerGrade; s++) {
            const sectionName = `Grade ${g} - Section ${String.fromCharCode(64 + s)}`;
            const sectionSchedule = {
                name: sectionName,
                days: []
            };

            for (let d = 0; d < 5; d++) {
                const dailySlots = [];

                for (let p = 0; p < classesPerDay; p++) {
                    // Check for Lunch
                    if (p + 1 === lunchSlot) {
                        dailySlots.push({ type: 'Lunch', subject: 'LUNCH BREAK', teacher: '' });
                        continue;
                    }

                    // Try to find a valid subject & teacher
                    let assigned = false;
                    let attempts = 0;

                    // Create a shuffled copy of subjects to try
                    const shuffledSubjects = [...subjects].sort(() => 0.5 - Math.random());

                    for (const subj of shuffledSubjects) {
                        // Simplified: Assign a random teacher to this subject
                        // continuously until we find one available or run out of teachers
                        // In a real app, we'd map Subject -> specific Teachers.
                        // Here, we just pick a random teacher and say they teach this subject for this instance.
                        // To make it slightly realistic, let's hash subject to a subset of teachers or just pick one valid teacher.

                        // Let's iterate all teachers and see if any are free
                        const shuffledTeachers = [...teachers].sort(() => 0.5 - Math.random());

                        for (const t of shuffledTeachers) {
                            if (isTeacherAvailable(t, d, p)) {
                                // Assign
                                dailySlots.push({ type: 'Class', subject: subj, teacher: t });
                                teacherSchedule[t][d][p] = true;
                                assigned = true;
                                break;
                            }
                        }
                        if (assigned) break;
                    }

                    if (!assigned) {
                        dailySlots.push({ type: 'Free', subject: 'LIBRARY / SELF STUDY', teacher: 'Staff' });
                    }
                }
                sectionSchedule.days.push({ day: days[d], slots: dailySlots });
            }
            fullCurriculum.push(sectionSchedule);
        }
    }

    return fullCurriculum;
};
