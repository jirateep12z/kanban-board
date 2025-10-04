# Kanban Board - Advanced Task Management System

Kanban Board เป็นเว็บแอปพลิเคชันสำหรับการจัดการงานแบบ Kanban ที่ทันสมัยและมีฟีเจอร์ครบครัน รองรับการทำงานแบบออฟไลน์ (PWA) พัฒนาด้วย Vanilla JavaScript, TailwindCSS และ IndexedDB โดยไม่ต้องพึ่งพา Framework ใดๆ ทำให้มีขนาดเล็กและรวดเร็ว

### ✨ Highlights

- 🚀 **ไม่ต้องติดตั้ง Backend** - ทำงานได้ทั้งหมดบน Browser
- 💾 **จัดเก็บข้อมูลในเครื่อง** - ใช้ IndexedDB และ Cookies
- 📱 **Progressive Web App (PWA)** - ติดตั้งและใช้งานแบบออฟไลน์ได้
- 🎨 **Advanced Dark Mode** - รองรับทั้ง Light และ Dark Theme พร้อม Auto-detect
- 🔄 **Drag & Drop** - ลากวางงานระหว่างคอลัมน์ได้อย่างลื่นไหล
- 📊 **Multi-board Support** - สร้างและจัดการหลายบอร์ดได้
- 🎯 **Custom Columns** - ปรับแต่งคอลัมน์ตามความต้องการ
- 📋 **Task Templates** - สร้างเทมเพลตงานเพื่อใช้ซ้ำ
- 🔁 **Recurring Tasks** - ตั้งงานที่ซ้ำตามรอบเวลา
- 📈 **Analytics Dashboard** - วิเคราะห์ผลงานและประสิทธิภาพ
- 📤 **Import/Export** - นำเข้าและส่งออกข้อมูลเป็น JSON
- 🔗 **Share Board** - แชร์งานผ่าน URL ในโหมดอ่านอย่างเดียว

---

## 🎯 Features

### การจัดการงาน (Task Management)

- ✅ **สร้าง แก้ไข ลบงาน** - จัดการงานได้อย่างสมบูรณ์
- 📝 **Markdown Editor** - เขียนรายละเอียดงานด้วย Markdown พร้อม Preview
- 🏷️ **Tags System** - จัดกลุ่มงานด้วยแท็กหลายสี (8 สี)
- 📅 **Due Date** - กำหนดวันครบกำหนดของงาน
- 🎯 **Priority Levels** - ระดับความสำคัญ (High, Medium, Low)
- 📎 **Attachments** - แนบไฟล์และรูปภาพได้สูงสุด 10 ไฟล์/งาน (5MB/ไฟล์)
- ✔️ **Subtasks** - สร้างงานย่อยพร้อม Progress Bar
- 💬 **Comments** - เพิ่มความคิดเห็นในแต่ละงาน
- 📋 **Task Templates** - บันทึกงานเป็นเทมเพลตเพื่อใช้ซ้ำ
- 🔁 **Recurring Tasks** - ตั้งงานซ้ำรายวัน/รายสัปดาห์/รายเดือน/รายปี

### การจัดการบอร์ด (Board Management)

- 📊 **Multi-board Support** - สร้างและจัดการหลายบอร์ดพร้อมกัน
- 🎯 **Custom Columns** - เพิ่ม/ลบ/แก้ไขคอลัมน์ตามต้องการ
- 🔀 **Drag & Drop** - ลากวางงานระหว่างคอลัมน์ได้อย่างลื่นไหล
- 🔄 **Reorder Tasks & Columns** - จัดเรียงงานและคอลัมน์ได้
- 🔍 **Search** - ค้นหางานจากชื่อ, รายละเอียด, และแท็ก
- 🎛️ **Filter & Sort** - กรองและเรียงงานตามเงื่อนไขต่างๆ
  - เรียงตาม: วันที่สร้าง, ชื่อ, วันครบกำหนด
  - กรองตาม: แท็ก, สถานะ, ช่วงเวลา

### การกรองตามวันที่ (Date Filtering)

- 📆 **Quick Filters** - Today, Yesterday, This Week, This Month, This Year
- 📅 **Custom Date** - เลือกวันที่ที่ต้องการ
- ⬅️➡️ **Date Navigation** - เลื่อนไปยังวันก่อนหน้า/ถัดไป

### การนำเข้า/ส่งออกข้อมูล (Import/Export)

- 📥 **Import JSON** - นำเข้าข้อมูลจากไฟล์ JSON
  - **Merge Mode** - รวมกับข้อมูลเดิม
  - **Replace Mode** - แทนที่ข้อมูลทั้งหมด
- 📤 **Export JSON** - ส่งออกข้อมูลพร้อมไฟล์แนบทั้งหมด
- 🔗 **Share URL** - แชร์บอร์ดผ่าน URL (Base64 Encoded)

### โหมดการใช้งาน (Usage Modes)

- ✏️ **Edit Mode** - แก้ไขและจัดการงานได้
- 👁️ **Read Mode** - อ่านอย่างเดียว ไม่สามารถแก้ไขได้
- 🔒 **Shared Board Mode** - โหมดอ่านอย่างเดียวสำหรับลิงก์ที่แชร์

### การวิเคราะห์และรายงาน (Analytics & Reports)

- 📈 **Analytics Dashboard** - แดชบอร์ดวิเคราะห์ผลงาน
- 📊 **Task Statistics** - สถิติงานทั้งหมด (รวม, เสร็จ, กำลังทำ, รอทำ)
- 🎯 **Completion Rate** - อัตราการทำงานสำเร็จ
- 📉 **Productivity Score** - คะแนนประสิทธิภาพการทำงาน (0-100)
- 📅 **Weekly Summary** - สรุปผลงานรายสัปดาห์
- 🏷️ **Tag Analytics** - วิเคราะห์แท็กที่ใช้บ่อย
- 📊 **Charts & Graphs** - กราฟแสดงผลแบบ Real-time

### ประสบการณ์ผู้ใช้ (User Experience)

- ⌨️ **Keyboard Shortcuts** - ทางลัดคีย์บอร์ด
  - `Ctrl + N` - สร้างงานใหม่
  - `Ctrl + K` - ค้นหางาน
  - `Ctrl + S` - บันทึกงาน (ในโหมดแก้ไข)
  - `Esc` - ปิด Modal
  - `?` - แสดงทางลัดทั้งหมด
- 🌓 **Advanced Dark Mode** - รองรับ Dark Theme พร้อม Auto-detect ตามระบบ
- 📱 **Responsive Design** - ใช้งานได้ทุกขนาดหน้าจอ
- 🖼️ **Image Viewer** - ดูรูปภาพแบบเต็มจอพร้อมนำทาง
- 🔔 **Notifications** - แจ้งเตือนเมื่อทำงานสำเร็จ
- 🎨 **Customizable UI** - ปรับแต่ง Theme และสีได้

---

## 📦 Installation

### วิธีที่ 1: ใช้งานโดยตรง (Recommended)

1. **Clone Repository**

   ```bash
   git clone https://github.com/yourusername/kanban-board.git
   cd kanban-board
   ```

2. **ติดตั้ง Dependencies (สำหรับ Prettier)**

   ```bash
   npm install
   ```

3. **เปิดไฟล์ในเบราว์เซอร์**
   ```bash
   # เปิดไฟล์ index.html ด้วยเบราว์เซอร์
   # หรือใช้ Live Server
   ```

### วิธีที่ 2: ใช้ Web Server

```bash
# ใช้ Python
python -m http.server 8000

# ใช้ Node.js
npx http-server

# ใช้ PHP
php -S localhost:8000
```

จากนั้นเปิด `http://localhost:8000` ในเบราว์เซอร์

### วิธีที่ 3: ติดตั้งเป็น PWA

1. เปิดเว็บไซต์ในเบราว์เซอร์
2. คลิกที่ไอคอน "Install" ในแถบ Address Bar
3. ยืนยันการติดตั้ง
4. ใช้งานแบบ Native App ได้เลย

---

## 💻 Usage

### การสร้างงานใหม่

1. คลิกปุ่ม **"+"** หรือกด `Ctrl + N`
2. กรอกข้อมูลงาน:
   - **Title** - ชื่องาน (Required)
   - **Description** - รายละเอียด (รองรับ Markdown)
   - **Status** - สถานะ (To Do, In Progress, Completed)
   - **Due Date** - วันครบกำหนด
   - **Priority** - ระดับความสำคัญ
   - **Tags** - แท็กสำหรับจัดกลุ่ม
   - **Attachments** - ไฟล์แนบ
   - **Subtasks** - งานย่อย
   - **Comments** - ความคิดเห็น
3. คลิก **"Create Task"** หรือกด `Ctrl + S`

### การย้ายงาน

**วิธีที่ 1: Drag & Drop**

- ลากการ์ดงานไปวางในคอลัมน์ที่ต้องการ

**วิธีที่ 2: Edit Task**

- คลิกไอคอนแก้ไขบนการ์ด
- เปลี่ยน Status
- บันทึก

### การค้นหาและกรอง

**Search**

- พิมพ์คำค้นหาในช่อง Search หรือกด `Ctrl + K`
- ค้นหาจาก: ชื่องาน, รายละเอียด, แท็ก

**Filter**

- คลิกไอคอน Filter
- เลือก Sort By และ Filter by Tag
- คลิก "Reset Filters" เพื่อล้างการกรอง

**Date Filter**

- คลิกไอคอนปฏิทิน
- เลือกช่วงเวลา หรือกำหนดวันที่เอง
- ใช้ลูกศรเพื่อเลื่อนวันที่

### การ Import/Export

**Export**

1. คลิกไอคอน Import/Export
2. คลิก "Export to JSON"
3. ไฟล์จะถูกดาวน์โหลดพร้อมไฟล์แนบทั้งหมด

**Import**

1. คลิกไอคอน Import/Export
2. เลือกไฟล์ JSON
3. เลือกโหมด:
   - **Merge** - รวมกับข้อมูลเดิม
   - **Replace** - แทนที่ข้อมูลทั้งหมด
4. คลิก "Import"

### การแชร์บอร์ด

1. คลิกไอคอน Share
2. คัดลอก URL ที่สร้างขึ้น
3. แชร์ URL ให้ผู้อื่น
4. ผู้รับจะเห็นบอร์ดในโหมดอ่านอ่างเดียว

### การจัดการหลายบอร์ด (Multi-board)

**สร้างบอร์ดใหม่**

1. คลิกปุ่ม "Boards" ที่มุมบนซ้าย
2. เลือก "Create New Board"
3. ตั้งชื่อและคำอธิบายบอร์ด
4. กำหนดคอลัมน์เริ่มต้น (หรือใช้ค่าเริ่มต้น)
5. คลิก "Create"

**สลับระหว่างบอร์ด**

- คลิกปุ่ม "Boards" และเลือกบอร์ดที่ต้องการ
- บอร์ดปัจจุบันจะถูกบันทึกอัตโนมัติ

### การปรับแต่งคอลัมน์ (Custom Columns)

**เพิ่มคอลัมน์ใหม่**

1. คลิกปุ่ม "Manage Columns"
2. เลือก "Add Column"
3. ตั้งชื่อและเลือกสีคอลัมน์
4. คลิก "Add"

**แก้ไข/ลบคอลัมน์**

- คลิกไอคอนแก้ไขที่คอลัมน์
- เปลี่ยนชื่อหรือสี หรือลบคอลัมน์

**จัดเรียงคอลัมน์**

- ลากคอลัมน์เพื่อจัดเรียงตำแหน่ง

### การใช้งาน Task Templates

**สร้างเทมเพลต**

1. สร้างงานตามปกติ
2. คลิกปุ่ม "Save as Template"
3. ตั้งชื่อเทมเพลต
4. คลิก "Save"

**ใช้เทมเพลต**

1. คลิกปุ่ม "Create from Template"
2. เลือกเทมเพลตที่ต้องการ
3. ตั้งชื่องานและวันครบกำหนด
4. คลิก "Create"

### การตั้งงานซ้ำ (Recurring Tasks)

**สร้างงานซ้ำ**

1. สร้างงานใหม่หรือแก้ไขงานที่มี
2. เปิดส่วน "Recurring Settings"
3. เลือกรูปแบบการซ้ำ:
   - **Daily** - ทุกวัน
   - **Weekly** - รายสัปดาห์ (เลือกวันได้)
   - **Monthly** - รายเดือน (เลือกวันที่ได้)
   - **Yearly** - รายปี
4. กำหนดช่วงเวลา (Interval) และวันสิ้นสุด (ถ้ามี)
5. คลิก "Save"

**จัดการงานซ้ำ**

- ดูรายการงานซ้ำทั้งหมดที่ "Recurring Tasks"
- เปิด/ปิดการทำงานของงานซ้ำ
- แก้ไขหรือลบงานซ้ำ

### การดู Analytics Dashboard

**เปิด Dashboard**

- คลิกปุ่ม "Analytics" 📊 ที่แถบเมนู

**ข้อมูลที่แสดง**

- **Task Statistics** - จำนวนงานทั้งหมด, เสร็จแล้ว, กำลังทำ
- **Completion Rate** - เปอร์เซ็นต์งานที่เสร็จ
- **Productivity Score** - คะแนนประสิทธิภาพ (0-100)
- **Time Reports** - รายงานเวลาทำงาน
- **Weekly Summary** - สรุปผลงานรายสัปดาห์
- **Charts** - กราฟแสดงแนวโน้มการทำงาน
- **Tag Analytics** - แท็กที่ใช้บ่อยที่สุด

### การจัดการ Dark Mode

**สลับ Theme**

- คลิกปุ่ม 🌓 ที่มุมบนขวา
- เลือก Light หรือ Dark Mode

**Auto-detect**

- ระบบจะตรวจจับ Theme ของระบบอัตโนมัติ
- สามารถปิด Auto-detect และเลือก Theme เองได้

---

## 🛠️ Technologies

### Frontend

- **Vanilla JavaScript (ES6+)** - ไม่ใช้ Framework
- **TailwindCSS 3.x** - Utility-first CSS Framework
- **EasyMDE** - Markdown Editor
- **Marked.js** - Markdown Parser

### Storage

- **IndexedDB** - จัดเก็บไฟล์แนบ
- **Cookies** - จัดเก็บข้อมูลงาน
- **LocalStorage** - จัดเก็บการตั้งค่า

### PWA

- **Service Worker** - Cache และ Offline Support
- **Web App Manifest** - PWA Configuration

### Development Tools

- **Prettier** - Code Formatter
- **prettier-plugin-tailwindcss** - TailwindCSS Class Sorting

---

## 📁 Project Structure

```
kanban-board/
├── css/
│   └── styles.css                  # Custom CSS และ Animations
├── js/
│   ├── app.js                      # Main Application Logic
│   └── classes/
│       ├── Database.js             # IndexedDB และ Cookie Management
│       ├── TaskManager.js          # Task CRUD Operations
│       ├── UIManager.js            # UI Rendering และ Event Handling
│       ├── DragDropManager.js      # Drag & Drop Logic
│       ├── BoardManager.js         # Multi-board Management
│       ├── TemplateManager.js      # Task Templates Management
│       ├── RecurringTaskManager.js # Recurring Tasks Logic
│       ├── AnalyticsManager.js     # Analytics & Reports
│       └── ThemeManager.js         # Theme & Dark Mode Management
├── image/
│   └── kanban_board.png            # App Icon
├── index.html                      # Main HTML File
├── manifest.json                   # PWA Manifest
├── service-worker.js               # Service Worker for PWA
├── package.json                    # Dependencies
├── .prettierrc                     # Prettier Configuration
├── .gitignore                      # Git Ignore Rules
├── LICENSE                         # MIT License
└── README.md                       # Documentation
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut   | Action                        |
| ---------- | ----------------------------- |
| `Ctrl + N` | สร้างงานใหม่                  |
| `Ctrl + K` | ค้นหางาน                      |
| `Ctrl + S` | บันทึกงาน (ในโหมดแก้ไข)       |
| `Esc`      | ปิด Modal                     |
| `?`        | แสดงทางลัดทั้งหมด             |
| `←` `→`    | นำทางรูปภาพ (ใน Image Viewer) |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Kanban Board

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 💡 Tips & Best Practices

### การจัดการงานอย่างมีประสิทธิภาพ

1. **ใช้ Priority Levels** - กำหนดความสำคัญของงานให้ชัดเจน
2. **ตั้ง Due Date** - กำหนดวันครบกำหนดเพื่อติดตามงาน
3. **แบ่งงานเป็น Subtasks** - แบ่งงานใหญ่เป็นงานย่อยๆ
4. **ใช้ Tags** - จัดกลุ่มงานด้วยแท็กเพื่อค้นหาง่าย
5. **Review Analytics** - ดู Dashboard เป็นประจำเพื่อปรับปรุง

### การใช้ Templates

- สร้าง Template สำหรับงานที่ทำซ้ำๆ
- ใช้ Template เพื่อประหยัดเวลา
- อัปเดต Template เมื่อมีการเปลี่ยนแปลง

### การตั้งงานซ้ำ

- ใช้ Recurring Tasks สำหรับงานประจำ
- ตรวจสอบงานซ้ำเป็นประจำ
- ปิดงานซ้ำที่ไม่ใช้แล้ว

---

## 🙏 Acknowledgments

- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [EasyMDE](https://github.com/Ionaru/easy-markdown-editor) - Markdown Editor
- [Marked.js](https://marked.js.org/) - Markdown Parser
- [Prettier](https://prettier.io/) - Code Formatter

---

## ⭐ Show Your Support

ถ้าคุณชอบโปรเจกต์นี้ อย่าลืมกด ⭐ Star ให้ด้วยนะครับ!

---

**Made with ❤️ by @jirateep12z**
