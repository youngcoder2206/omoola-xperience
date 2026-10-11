OMOOLA XPERIENCE WEBSITE + COMPLETED JOBS ADMIN
===============================================

WHAT'S NEW
- /admin  : private page where you upload completed jobs (photos AND videos) from your phone or laptop.
- "Our Work" section on the website shows everything you upload (hidden until you add your first job).
- The shop now uses a marketplace layout (search bar, category menu, product cards with Order on WhatsApp buttons). Edit products and prices in the P list at the top of script.js.

ONE-TIME SETUP (about 15 minutes)

1) Cloudinary (stores your photos and videos, free plan is fine)
   - Sign up at https://cloudinary.com
   - Copy your "Cloud name" from the dashboard.
   - Settings > Upload > Upload presets > Add upload preset:
       Signing mode = Unsigned, name it e.g. omoola_work, Save.
     (Optional: under Upload control, limit allowed formats to jpg,png,webp,heic,mp4,mov.)

2) Netlify
   - This site now has a backend (netlify/functions), so deploy it with Git or the Netlify CLI,
     not by dragging the folder:
       npm i -g netlify-cli
       netlify login
       netlify deploy --prod      (choose "create a new site", publish directory ".")
     Or push this folder to GitHub and import it at https://app.netlify.com/start
   - Site settings > Environment variables, add:
       ADMIN_PASSWORD              a strong password only you know
       CLOUDINARY_CLOUD_NAME       your cloud name
       CLOUDINARY_UPLOAD_PRESET    the preset name (e.g. omoola_work)
   - Redeploy after adding the variables.

HOW TO USE
- PRODUCTS tab: add a product with name, category, tag (New/Best seller), several sizes with prices (leave price empty for "Ask for price"), description, in-stock switch, and photos/video. Use Edit to change anything later. First time: tap "Load them here so I can edit them" to bring the 3 default products into the admin.
- COMPLETED JOBS tab:
- Go to  yourwebsite.com/admin , log in, add a title, choose a category, pick photos/videos, tap
  "Upload and publish". It appears on the website straight away (cached up to 1 minute).
- "Remove" takes a job off the website. (The files stay in your Cloudinary account; delete them there if you want.)

NOTES
- Large videos upload straight to Cloudinary, so phone videos work. Cloudinary's free plan has a per-file size limit (currently around 100 MB for videos), so keep clips short.
- Changing ADMIN_PASSWORD logs everyone out.
- The sample Unsplash photos in the shop are still placeholders; replace them with your own product photos.

Files: index.html, styles.css, script.js, work.js, admin/index.html, netlify/functions/api.mjs, package.json, netlify.toml

ENV FILE
- Keep your real .env file private; it is intentionally excluded from this fixed ZIP. Create a local .env file yourself (or use Netlify environment variables). .env is for testing on your own computer (netlify dev).
- The live website does NOT read .env. Add the same 3 values in Netlify > Site configuration > Environment variables
  (tip: Netlify has an "Import from a .env file" option there).
- .gitignore keeps .env out of GitHub. Never upload your real .env.
