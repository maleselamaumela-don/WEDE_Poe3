class AfterCareSite {
    constructor() {
        this.page = location.pathname.toLowerCase();
        this.addStyles();
        this.fadeIn();
        this.accordion();
        this.lightbox();
        this.search();
        if (this.page.includes("contact")) {
            this.contactForm();
            this.enquiryForm();
        }
    }

    // Small helper: create an element with some HTML inside it
    make(tag, html, id) {
        const el = document.createElement(tag);
        el.innerHTML = html;
        if (id) el.id = id;
        return el;
    }

    // CSS for the new features (added from here so the CSS files stay untouched)
    addStyles() {
        const style = this.make("style", `
            .fade { opacity: 0; transform: translateY(20px); transition: opacity .6s, transform .6s; }
            .fade.show { opacity: 1; transform: none; }
            .accordion-title { cursor: pointer; }
            .accordion-title::after { content: " \\25BE"; color: #D62839; }
            #lightbox { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.85); align-items: center; justify-content: center; z-index: 10; cursor: zoom-out; }
            #lightbox.open { display: flex; }
            #lightbox img { max-width: 90vw; max-height: 90vh; margin: 0; }
            #search { display: block; width: 100%; padding: .6rem; margin: 1rem 0; border: 2px solid #17120F; border-radius: 8px; font: inherit; }
            form { max-width: 500px; margin: 1rem 0 2rem; }
            form label { display: block; margin-top: 1rem; font-weight: 600; }
            form input, form select, form textarea { display: block; width: 100%; padding: .6rem; border: 2px solid #17120F; border-radius: 8px; font: inherit; background: #fff; }
            form button { margin-top: 1.2rem; padding: .7rem 1.6rem; border: 0; border-radius: 999px; background: #D62839; color: #F7F1E6; font: inherit; cursor: pointer; }
            .error { display: block; min-height: 1.2em; color: #D62839; font-size: .85rem; }
            .reply { font-weight: 600; }
        `);
        document.head.appendChild(style);
    }

    // Animation: headings, text, lists and the map fade in as you scroll
    fadeIn() {
        const watcher = new IntersectionObserver(items => {
            items.forEach(item => { if (item.isIntersecting) item.target.classList.add("show"); });
        });
        document.querySelectorAll("h1, h2, h3, p, ul, .map").forEach(el => {
            el.classList.add("fade");
            watcher.observe(el);
        });
    }

    // Accordion: click Programs / Operating hours / Meals to show or hide the list
    accordion() {
        document.querySelectorAll("h3.programs, h3.hours, h3.food-offered").forEach(title => {
            title.classList.add("accordion-title");
            title.tabIndex = 0;
            const toggle = () => { title.nextElementSibling.hidden = !title.nextElementSibling.hidden; };
            title.addEventListener("click", toggle);
            title.addEventListener("keydown", e => { if (e.key === "Enter") toggle(); });
        });
    }

    // Gallery lightbox: click any gallery picture (the 400px ones) to see it bigger
    lightbox() {
        const box = this.make("div", "<img alt='Enlarged picture'>", "lightbox");
        document.body.appendChild(box);
        document.querySelectorAll("img[width='400']").forEach(img => {
            img.style.cursor = "zoom-in";
            img.addEventListener("click", () => {
                box.querySelector("img").src = img.src;
                box.classList.add("open");
            });
        });
        box.addEventListener("click", () => box.classList.remove("open"));
        document.addEventListener("keydown", e => { if (e.key === "Escape") box.classList.remove("open"); });
    }

    // Search: a box above the programs list filters programs, hours and meals
    search() {
        const heading = document.querySelector("h3.programs");
        if (!heading) return;
        const input = this.make("input", "", "search");
        input.placeholder = "Search programs, hours or meals...";
        heading.before(input);
        input.addEventListener("input", () => {
            const text = input.value.toLowerCase();
            document.querySelectorAll(".list-programs li, .times li, .meal li").forEach(li => {
                li.hidden = !li.textContent.toLowerCase().includes(text);
            });
        });
    }

    // Validation shared by both forms. Returns true if every field is OK.
    validate(form) {
        let ok = true;
        form.querySelectorAll("[data-label]").forEach(field => {
            const value = field.value.trim();
            let msg = "";
            if (value === "") msg = field.dataset.label + " is required.";
            else if (field.name === "phone" && !/^0\d{9}$/.test(value.replace(/\s/g, ""))) msg = "Enter a 10-digit number starting with 0.";
            else if (field.name === "email" && !/^\S+@\S+\.\S+$/.test(value)) msg = "Enter a valid email address.";
            else if (field.name === "message" && value.length < 10) msg = "Message must be at least 10 characters.";
            else if (field.name === "children" && (value < 1 || value > 10)) msg = "Enter a number from 1 to 10.";
            field.parentElement.querySelector(".error").textContent = msg;
            if (msg) ok = false;
        });
        return ok;
    }

    // Contact form: validates, then opens an email to the centre
    contactForm() {
        const form = this.make("form", `
            <h2>Send us a message</h2>
            <label>Full name <input name="name" data-label="Name"><span class="error"></span></label>
            <label>Phone <input name="phone" data-label="Phone number"><span class="error"></span></label>
            <label>Email <input name="email" data-label="Email"><span class="error"></span></label>
            <label>Type of message
                <select name="topic" data-label="Type of message">
                    <option>General question</option><option>Complaint</option><option>Compliment</option>
                </select><span class="error"></span>
            </label>
            <label>Message <textarea name="message" rows="5" data-label="Message"></textarea><span class="error"></span></label>
            <button>Send email</button>
            <p class="reply"></p>
        `);
        form.noValidate = true;
        form.addEventListener("submit", e => {
            e.preventDefault();
            if (!this.validate(form)) return;
            const f = form.elements;
            const body = `Name: ${f.name.value}\nPhone: ${f.phone.value}\nEmail: ${f.email.value}\n\n${f.message.value}`;
            const subject = `${f.topic.value} from ${f.name.value}`;
            location.href = `mailto:B&Mcentre@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            form.querySelector(".reply").textContent = "Thank you! Your email is ready to send.";
        });
        document.querySelector("main").appendChild(form);
    }

    // Enquiry form: validates, then uses AJAX (fetch) to read the price from programs.html
    enquiryForm() {
        const form = this.make("form", `
            <h2>Enquiry</h2>
            <label>I would like to
                <select name="type" data-label="Enquiry type">
                    <option value="enrol">Enrol my child</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="sponsor">Sponsor the centre</option>
                </select><span class="error"></span>
            </label>
            <label>Full name <input name="name" data-label="Name"><span class="error"></span></label>
            <label>Email <input name="email" data-label="Email"><span class="error"></span></label>
            <label>Number of children (if enrolling) <input name="children" type="number" value="1" data-label="Number of children"><span class="error"></span></label>
            <button>Send enquiry</button>
            <p class="reply"></p>
        `);
        form.noValidate = true;
        form.addEventListener("submit", async e => {
            e.preventDefault();
            if (!this.validate(form)) return;
            const f = form.elements;
            const reply = form.querySelector(".reply");
            try {
                const page = await (await fetch("programs.html")).text();
                const price = Number(page.match(/R(\d+)/)[1]);
                if (f.type.value === "enrol") {
                    reply.textContent = `Thank you ${f.name.value}! The fee is R${price} per child, so R${price * f.children.value} per month. Spaces are available.`;
                } else {
                    reply.textContent = `Thank you ${f.name.value}! We will contact you within 2 working days about ${f.type.value === "volunteer" ? "volunteering" : "sponsoring us"}.`;
                }
                form.reset();
            } catch {
                reply.textContent = "Sorry, we could not process your enquiry. Please try again.";
            }
        });
        document.querySelector("main").appendChild(form);
    }
}

new AfterCareSite();