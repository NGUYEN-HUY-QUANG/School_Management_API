# School Management API

Hệ thống REST API quản lý hoạt động học tập cho trường THPT, thay thế cách quản lý bằng Excel hiện tại. Xây dựng bằng **NestJS**, **PostgreSQL**, **TypeORM**, xác thực bằng **JWT**, tài liệu API tự động bằng **Swagger**.

---

## Mục lục

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt & chạy dự án](#cài-đặt--chạy-dự-án)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Sơ đồ quan hệ dữ liệu (ERD)](#sơ-đồ-quan-hệ-dữ-liệu-erd)
- [Danh sách Entity](#danh-sách-entity)
- [Phân quyền](#phân-quyền)
- [Danh sách API](#danh-sách-api)
- [Tạo tài khoản Admin đầu tiên](#tạo-tài-khoản-admin-đầu-tiên)

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ / Runtime | Node.js + TypeScript |
| Framework | NestJS |
| Cơ sở dữ liệu | PostgreSQL |
| ORM | TypeORM |
| Xác thực | JWT (Passport) |
| Tài liệu API | Swagger (OpenAPI) |
| Validate dữ liệu | class-validator + ValidationPipe |
| Mã hoá mật khẩu | bcrypt |

---

## Cài đặt & chạy dự án

### 1. Clone & cài đặt package

```bash
git clone <repo-url>
cd school-management-api
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` ở thư mục gốc:

```env
DB_HOST=localhost
DB_PORT=2106
DB_USER=postgres
DB_PASS=postgres
DB_NAME=school_management

JWT_SECRET=super_secret_change_me
JWT_EXPIRES_IN=1d
```

### 3. Tạo database

```sql
CREATE DATABASE school_management;
```

### 4. Chạy ứng dụng

```bash
npm run start:dev
```

### 5. Truy cập Swagger

```
http://localhost:3000/swagger
```

---

## Kiến trúc hệ thống

Dự án được tổ chức theo **module**, mỗi module tương ứng với 1 nhóm nghiệp vụ, độc lập, chỉ phụ thuộc vào module khác thông qua service được export:

```
src/
├── common/                # Dùng chung: enum, decorator, guard
│   ├── enums/role.enum.ts
│   ├── decorators/roles.decorator.ts
│   ├── decorators/current-user.decorator.ts
│   ├── guards/jwt-auth.guard.ts
│   ├── guards/roles.guard.ts
│   └── interfaces/auth-user.interface.ts
│
├── modules/
│   ├── users/             # Tài khoản đăng nhập (nền tảng cho auth)
│   ├── auth/               # Đăng ký / đăng nhập / JWT
│   ├── subjects/           # Môn học
│   ├── teachers/           # Giáo viên (1-1 User, N-N Subject)
│   ├── classes/            # Lớp học (N-1 Teacher chủ nhiệm)
│   ├── students/           # Học sinh (1-1 User, N-1 Class)
│   ├── exams/              # Bài kiểm tra + điểm số
│   └── reports/            # Báo cáo thống kê
│
├── app.module.ts
└── main.ts
```

**Thứ tự phụ thuộc giữa các module** (module bên dưới phụ thuộc module bên trên):

```
Users ─┬─> Auth
       ├─> Teachers ──┬─> Classes ──> Students ──> Exams ──> Reports
       └─> Subjects ──┘
```

---

## Sơ đồ quan hệ dữ liệu (ERD)

```mermaid
erDiagram
    USER ||--o| TEACHER : "1-1"
    USER ||--o| STUDENT : "1-1"
    CLASS ||--o{ STUDENT : "1-N"
    TEACHER ||--o| CLASS : "1-1 (chủ nhiệm)"
    TEACHER }o--o{ SUBJECT : "N-N (giảng dạy)"
    SUBJECT ||--o{ EXAM : "1-N"
    CLASS ||--o{ EXAM : "1-N"
    TEACHER ||--o{ EXAM : "1-N (phụ trách)"
    EXAM ||--o{ SCORE : "1-N"
    STUDENT ||--o{ SCORE : "1-N"

    USER {
        uuid id PK
        string email
        string password
        string fullName
        enum role
        boolean isActive
    }

    SUBJECT {
        uuid id PK
        string name
        string description
    }

    TEACHER {
        uuid id PK
        uuid userId FK
        string phone
        string address
        date hireDate
    }

    CLASS {
        uuid id PK
        string name
        string description
        uuid homeroomTeacherId FK "unique"
    }

    STUDENT {
        uuid id PK
        uuid userId FK
        uuid classId FK
        string phone
        string address
        date dateOfBirth
    }

    EXAM {
        uuid id PK
        string title
        date examDate
        uuid subjectId FK
        uuid classId FK
        uuid teacherId FK
    }

    SCORE {
        uuid id PK
        uuid examId FK
        uuid studentId FK
        float score
    }
```

---

## Danh sách Entity

### User
Tài khoản đăng nhập hệ thống. Không lưu trực tiếp thông tin nghiệp vụ (học sinh/giáo viên), chỉ lo việc xác thực.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | uuid | PK |
| email | string | unique |
| password | string | đã hash bằng bcrypt, ẩn khi trả response |
| fullName | string | |
| role | enum | `admin` \| `teacher` \| `student` |
| isActive | boolean | dùng để khoá tài khoản |

### Subject (Môn học)
Không phụ thuộc entity nào khác. Quan hệ N-N với Teacher.

### Teacher (Giáo viên)
- Quan hệ **1-1** với `User`.
- Quan hệ **N-N** với `Subject` qua bảng trung gian `teacher_subjects`.
- Được `Class` tham chiếu tới với vai trò chủ nhiệm.

### Class (Lớp học)
- Quan hệ **1-1** với `Teacher` (chủ nhiệm) — ràng buộc `unique` trên cột `homeroom_teacher_id`, đảm bảo 1 giáo viên chỉ chủ nhiệm đúng 1 lớp.
- Quan hệ **1-N** với `Student`.

### Student (Học sinh)
- Quan hệ **1-1** với `User`.
- Quan hệ **N-1** với `Class` (bắt buộc phải thuộc 1 lớp).

### Exam (Bài kiểm tra)
- Quan hệ **N-1** với `Subject`, `Class`, `Teacher` (người phụ trách).

### Score (Điểm)
- Bảng trung gian giữa `Exam` và `Student`, có thêm thuộc tính `score`.
- Ràng buộc **unique (examId, studentId)**: 1 học sinh chỉ có 1 điểm cho 1 bài kiểm tra.

---

## Phân quyền

Hệ thống có 3 loại tài khoản: **Admin**, **Teacher**, **Student**. Phân quyền được thực hiện qua `JwtAuthGuard` (xác thực token) kết hợp `RolesGuard` + decorator `@Roles(...)` (kiểm tra vai trò) trên từng route.

| Chức năng | Admin | Teacher | Student |
|---|:---:|:---:|:---:|
| Quản lý User | ✅ | ❌ | ❌ |
| Quản lý Subject | ✅ tạo/sửa/xoá | 👁 chỉ xem | 👁 chỉ xem |
| Quản lý Teacher | ✅ | 👁 xem chính mình | ❌ |
| Quản lý Class | ✅ | 👁 chỉ xem | 👁 chỉ xem |
| Quản lý Student | ✅ | 👁 xem danh sách/tìm kiếm | 👁 chỉ xem hồ sơ chính mình |
| Tạo/sửa/xoá Exam | ✅ (mọi giáo viên) | ✅ (chỉ bài của chính mình) | ❌ |
| Nhập điểm | ✅ | ✅ (chỉ bài của chính mình) | ❌ |
| Xem điểm | ✅ | ✅ | 👁 chỉ xem điểm chính mình |
| Xem Reports | ✅ | ✅ | ❌ |

Ngoài kiểm tra theo role, hệ thống còn kiểm tra **quyền sở hữu dữ liệu** ở tầng service:
- Giáo viên chỉ được sửa/xoá/nhập điểm cho **Exam do chính mình tạo**.
- Học sinh chỉ được xem **hồ sơ và điểm của chính mình**, không xem được của học sinh khác dù biết ID.

---

## Danh sách API

### Auth
| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/auth/register` | Public (luôn tạo role Student) |
| POST | `/auth/login` | Public |

### Users
| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/users` | Admin |
| GET | `/users` | Admin |
| GET | `/users/:id` | Admin |
| PATCH | `/users/:id` | Admin |
| DELETE | `/users/:id` | Admin |

### Subjects
| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/subjects` | Admin |
| GET | `/subjects` | Đã đăng nhập |
| GET | `/subjects/:id` | Đã đăng nhập |
| PATCH | `/subjects/:id` | Admin |
| DELETE | `/subjects/:id` | Admin |

### Teachers
| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/teachers` | Admin |
| GET | `/teachers` | Admin |
| GET | `/teachers/:id` | Admin, Teacher |
| PATCH | `/teachers/:id` | Admin |
| DELETE | `/teachers/:id` | Admin |

### Classes
| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/classes` | Admin |
| GET | `/classes` | Đã đăng nhập |
| GET | `/classes/:id` | Đã đăng nhập |
| PATCH | `/classes/:id` | Admin |
| PATCH | `/classes/:id/homeroom-teacher` | Admin |
| DELETE | `/classes/:id/homeroom-teacher` | Admin |
| DELETE | `/classes/:id` | Admin |

### Students
| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/students` | Admin |
| GET | `/students` | Admin, Teacher |
| GET | `/students/search?keyword=` | Admin, Teacher |
| GET | `/students/class/:classId` | Admin, Teacher |
| GET | `/students/:id` | Admin, Teacher, Student (chính mình) |
| PATCH | `/students/:id` | Admin |
| PATCH | `/students/:id/transfer-class` | Admin |
| DELETE | `/students/:id` | Admin |

### Exams & Scores
| Method | Endpoint | Quyền |
|---|---|---|
| POST | `/exams` | Admin, Teacher |
| GET | `/exams` | Admin, Teacher |
| GET | `/exams/class/:classId` | Admin, Teacher, Student |
| GET | `/exams/:id` | Admin, Teacher, Student |
| PATCH | `/exams/:id` | Admin, Teacher (chủ bài) |
| DELETE | `/exams/:id` | Admin, Teacher (chủ bài) |
| POST | `/exams/:examId/scores` | Admin, Teacher (chủ bài) |
| GET | `/exams/:examId/scores` | Admin, Teacher |
| GET | `/students/:studentId/scores` | Admin, Teacher, Student (chính mình) |

### Reports
| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/reports/teachers-with-homeroom` | Admin, Teacher |
| GET | `/reports/teachers-without-homeroom` | Admin, Teacher |
| GET | `/reports/student-averages` | Admin, Teacher |
| GET | `/reports/top-students?limit=` | Admin, Teacher |
| GET | `/reports/failing-students/:subjectId?threshold=` | Admin, Teacher |

> Xem chi tiết đầy đủ (request/response schema) tại Swagger UI: `/api-docs`.

---

## Tạo tài khoản Admin đầu tiên

Hệ thống hiện chưa có API công khai để tạo tài khoản Admin (vì lý do bảo mật — tránh ai cũng tự đăng ký thành Admin). Để tạo tài khoản Admin đầu tiên, thực hiện 1 trong 2 cách:

**Cách 1 — Đăng ký Student rồi update role thủ công:**
```bash
# 1. Gọi POST /auth/register để tạo tài khoản (mặc định role = student)
# 2. Update trực tiếp trong Postgres:
```
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@school.com';
```

**Cách 2 — Insert thẳng vào DB** (password cần hash bcrypt trước, không lưu plain text).

> Ghi chú: đây là hạn chế đã biết của hệ thống hiện tại, phù hợp cho mục đích học tập/demo. Trong dự án thực tế nên có script seed riêng chạy 1 lần lúc khởi tạo hệ thống.