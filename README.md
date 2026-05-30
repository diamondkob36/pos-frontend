# 🛒 POS System (Point of Sale)

ระบบขายหน้าร้านแบบครบวงจร สำหรับร้านเครื่องดื่มและอาหาร พร้อมระบบจัดการสินค้า ท็อปปิ้ง และรายงานยอดขาย

## 📋 ภาพรวมโปรเจค

โปรเจคนี้เป็นระบบ POS แบบ Full-Stack ที่แบ่งเป็น 2 ส่วนหลัก:

### 🎨 Frontend (pos-frontend)
- **หน้าแคชเชียร์**: เลือกสินค้า กำหนดขนาด/ประเภท เพิ่มท็อปปิ้ง และชำระเงิน
- **หน้าประวัติการขาย**: ดูรายการบิล สถิติยอดขาย และกราฟแสดงผล
- **หน้าจัดการสินค้า**: เพิ่ม/แก้ไข/ลบ สินค้า หมวดหมู่ และท็อปปิ้ง
- **หน้าจัดการผู้ใช้**: จัดการบัญชีพนักงานและสิทธิ์การเข้าถึง
- **ระบบ Authentication**: เข้าสู่ระบบด้วย JWT Token

### ⚙️ Backend (pos-backend)
- **RESTful API**: จัดการข้อมูลสินค้า ท็อปปิ้ง หมวดหมู่ บิลขาย และผู้ใช้
- **Authentication**: ระบบ Login/Logout ด้วย JWT และ Passport
- **Database**: เชื่อมต่อ PostgreSQL ผ่าน Prisma ORM
- **Authorization**: ป้องกันเส้นทาง API ด้วย JWT Guard

---

## 🛠️ เทคโนโลยีที่ใช้

### Frontend Stack
| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|-----------|---------|---------|
| **Next.js** | 16.1.6 | React Framework พร้อม App Router และ Server Components |
| **React** | 19.2.3 | UI Library สำหรับสร้าง Component |
| **TypeScript** | 5.x | Type Safety และ Developer Experience |
| **Tailwind CSS** | 4.x | Utility-First CSS Framework |
| **Recharts** | 3.8.0 | กราฟแสดงยอดขายและสถิติ |
| **XLSX** | 0.18.5 | Export ข้อมูลเป็นไฟล์ Excel |

### Backend Stack
| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|-----------|---------|---------|
| **NestJS** | 11.x | Node.js Framework แบบ Modular และ Scalable |
| **Prisma** | 7.5.0 | ORM สำหรับจัดการ Database |
| **PostgreSQL** | - | Relational Database |
| **Passport JWT** | 4.0.1 | Authentication Strategy |
| **bcrypt** | 6.0.0 | Hash Password อย่างปลอดภัย |
| **TypeScript** | 5.7.3 | Type Safety สำหรับ Backend |

---

## 📊 โครงสร้างฐานข้อมูล

```prisma
- Product      → สินค้า (ชื่อ, ราคา, รูปภาพ, หมวดหมู่)
- Topping      → ท็อปปิ้ง (ชื่อ, ราคา, หมวดหมู่)
- Category     → หมวดหมู่สินค้า (มีตัวเลือกขนาด/ประเภทหรือไม่)
- Order        → หัวบิล (ยอดรวม, วันที่, เลขบิลประจำวัน)
- OrderItem    → รายการสินค้าในบิล (ขนาด, ท็อปปิ้ง, หมายเหตุ)
- User         → ผู้ใช้งาน (username, password, role, name)
```

---

## 🚀 วิธีการติดตั้งและรันโปรเจค

### 1️⃣ ติดตั้ง Dependencies

```bash
# Frontend
cd pos-frontend
npm install

# Backend
cd pos-backend
npm install
```

### 2️⃣ ตั้งค่า Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
JWT_SECRET="your-secret-key-here"
PORT=3001
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3️⃣ ตั้งค่าฐานข้อมูล

```bash
cd pos-backend

# สร้างตารางในฐานข้อมูล
npx prisma migrate dev

# เพิ่มข้อมูลตัวอย่าง (Seed)
npx prisma db seed
```

### 4️⃣ รันโปรเจค

```bash
# รัน Backend (Terminal 1)
cd pos-backend
npm run start:dev
# เปิดที่ http://localhost:3001

# รัน Frontend (Terminal 2)
cd pos-frontend
npm run dev
# เปิดที่ http://localhost:3000
```

---

## 🎯 ฟีเจอร์หลัก

### 👤 ระบบผู้ใช้
- ✅ Login/Logout ด้วย JWT Authentication
- ✅ สิทธิ์การใช้งาน 2 ระดับ: **Manager** และ **Cashier**
- ✅ จัดการบัญชีพนักงาน (เฉพาะ Manager)

### 🛍️ หน้าแคชเชียร์
- ✅ เลือกสินค้าตามหมวดหมู่
- ✅ กำหนดขนาด (S/M/L) และประเภท (ร้อน/เย็น/ปั่น)
- ✅ เพิ่มท็อปปิ้งหลายรายการ พร้อมปรับจำนวน
- ✅ เพิ่มหมายเหตุพิเศษ (เช่น หวานน้อย, ไม่ใส่น้ำแข็ง)
- ✅ คำนวณราคาอัตโนมัติ
- ✅ ชำระเงินและพิมพ์ใบเสร็จ

### 📈 หน้าประวัติและรายงาน
- ✅ ดูรายการบิลทั้งหมด พร้อมรายละเอียด
- ✅ สถิติยอดขาย (วันนี้, สัปดาห์นี้, เดือนนี้)
- ✅ กราฟแสดงยอดขายรายวัน
- ✅ Export ข้อมูลเป็น Excel

### ⚙️ หน้าจัดการ (Admin)
- ✅ จัดการสินค้า: เพิ่ม/แก้ไข/ลบ/เปิด-ปิดการขาย
- ✅ จัดการหมวดหมู่: กำหนดว่ามีตัวเลือกขนาด/ประเภทหรือไม่
- ✅ จัดการท็อปปิ้ง: เพิ่ม/แก้ไข/ลบ พร้อมจัดหมวดหมู่
- ✅ จัดการผู้ใช้: สร้างบัญชีพนักงานใหม่

---

## 📱 Responsive Design

- ✅ รองรับหน้าจอ Desktop, Tablet และ Mobile
- ✅ ปรับ Layout อัตโนมัติตามขนาดหน้าจอ
- ✅ Touch-friendly สำหรับ Tablet POS

---

## 🔐 Security Features

- ✅ **JWT Authentication**: Token-based authentication with expiration
- ✅ **Password Hashing**: bcrypt with 10 salt rounds
- ✅ **Role-Based Access Control (RBAC)**: Manager, Supervisor, Cashier roles
- ✅ **Input Validation**: class-validator for all API endpoints
- ✅ **SQL Injection Prevention**: Prisma ORM with parameterized queries
- ✅ **CORS Configuration**: Restricted origins
- ✅ **Protected Routes**: JWT Guard on all sensitive endpoints
- ✅ **Environment Variables**: Sensitive data in .env files (not committed)
- ✅ **Rate Limiting**: Prevent brute force and DDoS attacks
  - Login: 5 attempts/minute
  - Create Order: 5 requests/second
  - Delete Operations: 3-10 requests/minute
  - Read Operations: Unlimited

### ⚠️ ก่อนใช้งานครั้งแรก

**สร้าง JWT Secret Key ใหม่:**
```bash
cd pos-backend
node scripts/generate-secret.js
```

แล้วคัดลอก Secret Key ที่ได้ไปใส่ในไฟล์ `.env`

**อ่านเพิ่มเติม**: 
- [SECURITY.md](../SECURITY.md) - รายละเอียดความปลอดภัยทั้งหมด
- [RATE_LIMITING.md](../pos-backend/RATE_LIMITING.md) - การตั้งค่า Rate Limiting

---

## 📦 Scripts ที่ใช้บ่อย

### Frontend
```bash
npm run dev      # รัน Development Server
npm run build    # Build สำหรับ Production
npm run start    # รัน Production Server
npm run lint     # ตรวจสอบ Code Style
```

### Backend
```bash
npm run start:dev    # รัน Development Server (Hot Reload)
npm run build        # Build TypeScript
npm run start:prod   # รัน Production Server
npx prisma studio    # เปิด Prisma Studio (Database GUI)
npx prisma migrate dev  # สร้าง Migration ใหม่
```

---

## 📝 License

This project is private and unlicensed.

---

## 👨‍💻 Developer Notes

- Frontend ใช้ **App Router** ของ Next.js 16
- Backend ใช้ **Module Pattern** ของ NestJS
- Database Schema จัดการผ่าน **Prisma Migrate**
- API Endpoint: `http://localhost:3001`
- Frontend URL: `http://localhost:3000`

---

## 🆘 Troubleshooting

### ปัญหา: ไม่สามารถเชื่อมต่อ Backend
- ตรวจสอบว่า Backend รันอยู่ที่ Port 3001
- ตรวจสอบ CORS Settings ใน `main.ts`
- ตรวจสอบ `.env` และ `.env.local`

### ปัญหา: Database Connection Error
- ตรวจสอบ `DATABASE_URL` ใน `.env`
- ตรวจสอบว่า PostgreSQL รันอยู่
- รัน `npx prisma migrate dev` ใหม่

### ปัญหา: JWT Token Invalid
- ตรวจสอบ `JWT_SECRET` ใน Backend `.env`
- ลอง Logout และ Login ใหม่
- ตรวจสอบว่า Token ถูกส่งใน Header `Authorization: Bearer <token>`
