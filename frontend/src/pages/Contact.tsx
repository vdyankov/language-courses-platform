import { useState, type FormEvent } from 'react';
import { BrandLogo } from '../components/BrandLogo.tsx';

const address = 'ВВМУ "Н. Й. Вапцаров", ул. "Васил Друмев" 73, 9002 Варна';
const mapUrl = 'https://www.google.com/maps?q=%D0%92%D0%92%D0%9C%D0%A3%20%22%D0%9D.%20%D0%99.%20%D0%92%D0%B0%D0%BF%D1%86%D0%B0%D1%80%D0%BE%D0%B2%22%2C%20%D1%83%D0%BB.%20%22%D0%92%D0%B0%D1%81%D0%B8%D0%BB%20%D0%94%D1%80%D1%83%D0%BC%D0%B5%D0%B2%22%2073%2C%209002%20%D0%92%D0%B0%D1%80%D0%BD%D0%B0&output=embed';

export const Contact = () => {
    const [sent, setSent] = useState(false);

    const submitContact = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSent(true);
        event.currentTarget.reset();
    };

    return (
        <section className="contact-page">
            <div className="contact-layout">
                <div className="map-panel">
                    <iframe
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={mapUrl}
                        title="Polyglot Space location in Varna"
                    />
                    <div className="address-card">
                        <p className="eyebrow">Локация</p>
                        <h2><BrandLogo className="section-brand">Polyglot Space Varna</BrandLogo></h2>
                        <p>{address}</p>
                    </div>
                </div>

                <div className="contact-card">
                    <p className="eyebrow">Contacts</p>
                    <h1>Свържете се с нас</h1>
                    <p className="lead">
                        Имате въпрос за курс, ниво или записване? Изпратете ни съобщение и ще ви помогнем да изберете най-подходящата програма.
                    </p>

                    {sent ? (
                        <p className="notice success">Съобщението е изпратено успешно.</p>
                    ) : null}

                    <form className="contact-form" onSubmit={submitContact}>
                        <label>
                            <span>Име</span>
                            <input name="name" required />
                        </label>
                        <label>
                            <span>Имейл</span>
                            <input name="email" required type="email" />
                        </label>
                        <label>
                            <span>Съобщение</span>
                            <textarea name="message" required rows={6} />
                        </label>
                        <button className="primary-action" type="submit">Изпрати</button>
                    </form>
                </div>
            </div>
        </section>
    );
};
