# تشغيل شات بوني بأمان

الواجهة الآن لا تحتوي على مفتاح Gemini ولا تتصل بـ Google مباشرة. ملف `worker.js` هو وسيط Cloudflare Worker، والمفتاح يُحفظ كـ Secret على الخادم.

## النشر

1. أنشئ Cloudflare Worker جديدًا والصق محتوى `worker.js`، أو انشره باستخدام Wrangler.
2. أضف سرًا باسم `GEMINI_API_KEY` من إعدادات Worker. لا تضع القيمة في Git أو داخل `index.html`.
3. اربط مسار Worker على النطاق `https://abdul7ahomar-cloud.github.io/api/chat` عبر Cloudflare Worker Route أو غيّر `API_PATH` في `index.html` إلى رابط Worker المباشر.
4. اسمح فقط بأصل الموقع الموجود في `ALLOWED_ORIGINS`.
5. ألغِ مفاتيح Gemini/Groq التي ظهرت سابقًا في سجل GitHub وأنشئ مفتاحًا جديدًا.

بعد نشر Worker، جرّب شات بوني وقراءة الأبراج. في حال توقف الوسيط، ستستمر الردود الاحتياطية بدل كشف المفتاح.
