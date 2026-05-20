# نشر المشروع على Railway

## سبب الخطأ في الصورة

رسالة **"Problem processing request"** غالباً من:

1. **عطل مؤقت في Railway** (الشريط الأصفر: Builds are slow to progress)
2. مشكلة مؤقتة في ربط GitHub

**الحل:** انتظر قليلاً ثم جرّب مرة أخرى، أو أنشئ مشروعاً فارغاً ثم أضف الريبو يدوياً.

---

## خطوات النشر (خدمتان من نفس الريبو)

### 1) إنشاء المشروع

1. [Railway Dashboard](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → اختر **`khaledMohey/4aleh`**
3. إذا فشل: **Empty Project** → **Add Service** → **GitHub Repo** → `4aleh`

### 2) قاعدة البيانات PostgreSQL

1. في المشروع: **+ New** → **Database** → **PostgreSQL**
2. افتح خدمة PostgreSQL → **Variables** → انسخ `DATABASE_URL`

### 3) خدمة Backend (Django)

1. **Add Service** → نفس الريبو `4aleh` (أو Duplicate)
2. **Settings** → **Root Directory**: `backend`
3. **Variables**:

| Variable | القيمة |
|----------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Reference من PostgreSQL) |
| `SECRET_KEY` | مفتاح عشوائي طويل |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | رابط الفرونت بعد النشر |

4. **Networking** → **Generate Domain** (مثلاً `xxx.up.railway.app`)
5. أضف الدومين في `ALLOWED_HOSTS` و `RAILWAY_PUBLIC_DOMAIN` (يُضاف تلقائياً إن وُجد)

### 4) خدمة Frontend (Next.js)

1. **Add Service** → نفس الريبو
2. **Root Directory**: `frontend`
3. **Variables**:

| Variable | القيمة |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND-DOMAIN.up.railway.app/api/v1` |

4. **Generate Domain** للفرونت

### 5) بعد النشر

```bash
# من Railway Shell لخدمة Backend (اختياري)
python manage.py seed
```

حدّث `CORS_ALLOWED_ORIGINS` برابط الفرونت النهائي.

---

## بديل أسرع

| الجزء | المنصة |
|-------|--------|
| Frontend | [Vercel](https://vercel.com) أو Netlify |
| Backend + DB | Railway |

---

## الريبو

https://github.com/khaledMohey/4aleh
