# 🛒 POS System (Point of Sale)

ระบบขายหน้าร้านแบบครบวงจร สำหรับร้านเครื่องดื่มและอาหาร พร้อมระบบจัดการสินค้า ท็อปปิ้ง และรายงานยอดขาย

## 📋 ภาพรวมโปรเจค

ระบบ POS Full-Stack แบ่งเป็น 2 ส่วน:

### 🎨 Frontend (Next.js + TypeScript)
- หน้าแคชเชียร์: เลือกสินค้า กำหนดขนาด/ประเภท เพิ่มท็อปปิ้ง ชำระเงิน
- หน้าประวัติ: ดูบิล สถิติยอดขาย กราฟ Export Excel
- หน้าจัดการ: สินค้า หมวดหมู่ ท็อปปิ้ง บัญชีพนักงาน
- Authentication: JWT Token พร้อม Auto Logout เมื่อหมดอายุ
- Toast Notification: แจ้งเตือนแบบทันสมัย

### ⚙️ Backend (NestJS + Prisma + PostgreSQL)
- RESTful API: CRUD สินค้า ท็อปปิ้ง หมวดหมู่ บิล ผู้ใช้
- Authentication: JWT + Passport + bcrypt
- Authorization: Role-Based (Manager, Supervisor, Cashier)
- Rate Limiting: ป้องกัน Brute Force และ DDoS

---

## 🛠️ เทคโนโลยีหลัก

**Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS + Recharts + XLSX  
**Backend**: NestJS 11 + Prisma 7 + PostgreSQL + Passport JWT + bcrypt

---

## 📊 โครงสร้างฐานข้อมูล

**Product** → สินค้า (ชื่อ, ราคา, รูปภาพ?, หมวดหมู่, สถานะ)  
**Topping** → ท็อปปิ้ง (ชื่อ, ราคา, หมวดหมู่, สถานะ)  
**Category** → หมวดหมู่ (มีขนาด/ประเภทหรือไม่)  
**Order** → หัวบิล (ยอดรวม, วันที่, เลขบิล)  
**OrderItem** → รายการในบิล (ขนาด, ท็อปปิ้ง, หมายเหตุ)  
**User** → ผู้ใช้ (username, password, role, name, สถานะ)

---

## 🚀 เริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies
```bash
cd pos-frontend && npm install
cd pos-backend && npm install
```

### 2. ตั้งค่า Environment
**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
JWT_SECRET="your-secret-key"  # สร้างด้วย: node scripts/generate-secret.js
PORT=3001
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. ตั้งค่า Database
```bash
cd pos-backend
npx prisma migrate dev    # สร้างตาราง
npx prisma db seed        # เพิ่มข้อมูลตัวอย่าง
npx prisma generate       # Generate Prisma Client
```

### 4. รันโปรเจค
```bash
# Terminal 1: Backend
cd pos-backend && npm run start:dev

# Terminal 2: Frontend  
cd pos-frontend && npm run dev
```

เปิดเบราว์เซอร์: **http://localhost:3000**

---

## 🎯 ฟีเจอร์หลัก

### 👤 ระบบผู้ใช้
- JWT Authentication พร้อม Auto Logout เมื่อ Token หมดอายุ
- สิทธิ์ 3 ระดับ: Manager, Supervisor, Cashier
- จัดการบัญชีพนักงาน เปิด-ปิดสิทธิ์

### 🛍️ หน้าแคชเชียร์
- เลือกสินค้าตามหมวดหมู่ กรองสินค้าหมด
- กำหนดขนาด (S/M/L) และประเภท (ร้อน/เย็น/ปั่น)
- เพิ่มท็อปปิ้งหลายรายการ ปรับจำนวน
- หมายเหตุพิเศษ (หวานน้อย, ไม่ใส่น้ำแข็ง)
- คำนวณราคาอัตโนมัติ ชำระเงิน พิมพ์ใบเสร็จ

### 📈 หน้าประวัติและรายงาน
- ดูบิลทั้งหมด พร้อมรายละเอียด
- สถิติยอดขาย (วันนี้, สัปดาห์, เดือน)
- กราฟยอดขายรายวัน
- Export Excel

### ⚙️ หน้าจัดการ (Admin)
- จัดการสินค้า: เพิ่ม/แก้ไข/เปิด-ปิดการขาย (รูปภาพเป็น optional)
- จัดการหมวดหมู่: กำหนดตัวเลือกขนาด/ประเภท
- จัดการท็อปปิ้ง: เพิ่ม/แก้ไข/เปิด-ปิดการขาย
- จัดการผู้ใช้: สร้าง/แก้ไข/เปิด-ปิดสิทธิ์ (แก้ไขได้โดยไม่ต้องเปลี่ยนรหัส)

---

## 📱 UI/UX Features

- Responsive Design: Desktop, Tablet, Mobile
- Toast Notification แทน alert/confirm
- Modal Dialog สวยงาม พร้อม Animation
- Touch-friendly สำหรับ Tablet POS

---

## 🔐 ความปลอดภัย

- **JWT Authentication** พร้อม Auto Logout เมื่อหมดอายุ
- **Password Hashing** ด้วย bcrypt (10 salt rounds)
- **Role-Based Access Control** (Manager, Supervisor, Cashier)
- **Rate Limiting** ป้องกัน Brute Force (Login: 5/min, Order: 5/sec)
- **Input Validation** ทุก API endpoint
- **SQL Injection Prevention** ด้วย Prisma ORM
- **CORS Configuration** จำกัด origins

### ⚠️ ก่อนใช้งานครั้งแรก
```bash
cd pos-backend
node scripts/generate-secret.js  # สร้าง JWT Secret
# คัดลอก Secret ไปใส่ใน .env
```

---

## 📦 คำสั่งที่ใช้บ่อย

**Frontend**
```bash
npm run dev        # Development
npm run build      # Production Build
npm run lint       # ตรวจสอบ Code
```

**Backend**
```bash
npm run start:dev       # Development (Hot Reload)
npm run start:prod      # Production
npx prisma studio       # Database GUI
npx prisma generate     # Generate Client (หลังแก้ schema)
npx prisma migrate dev  # สร้าง Migration
```

---

## �‍💻 หมายเหตุสำหรับนักพัฒนา

- Frontend: Next.js 16 App Router + Server Components
- Backend: NestJS Module Pattern + Prisma ORM
- API: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- หลังแก้ `schema.prisma` ต้อง run `npx prisma generate` และ restart Backend

---

## 🆘 แก้ปัญหาที่พบบ่อย

**Backend ไม่ทำงาน**
- ตรวจสอบ Port 3001 ว่าถูกใช้งานอยู่หรือไม่: `netstat -ano | findstr :3001`
- ปิด process เก่า: `taskkill /F /PID <pid>`
- ตรวจสอบ `.env` และ `DATABASE_URL`

**Database Error**
- ตรวจสอบ PostgreSQL รันอยู่หรือไม่
- Run `npx prisma migrate dev` ใหม่
- Run `npx prisma generate` หลังแก้ schema

**JWT Token Invalid**
- ตรวจสอบ `JWT_SECRET` ใน `.env`
- Logout และ Login ใหม่
- ระบบจะ Auto Logout เมื่อ Token หมดอายุ

**TypeScript Error หลังแก้ Prisma Schema**
- Run `npx prisma generate`
- Restart Backend (ปิดและเปิดใหม่)
