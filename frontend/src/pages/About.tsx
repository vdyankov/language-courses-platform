import { BrandLogo } from '../components/BrandLogo.tsx';

export const About = () => {
    return (
        <section className="about-page">
            <div className="about-split">
                <div className="about-image" aria-label="Books and globe" />
                <div className="about-copy">
                    <p className="eyebrow brand-eyebrow">
                        <BrandLogo compact>About Polyglot Space</BrandLogo>
                    </p>
                    <h1>Езикът е пространство. Ние ви помагаме да влезете в него уверено.</h1>
                    <p className="lead">
                        Ние сме <strong>Polyglot Space</strong> - образователен център за хора, които искат да говорят
                        по-свободно, да мислят по-смело и да откриват света през нови езици.
                    </p>
                    <p>
                        Съществуваме от 2023 г. и от самото начало работим с една ясна цел: да развиваме речника,
                        увереността и реалните комуникативни умения на нашите курсисти. При нас езикът не е просто
                        списък с думи и правила, а жив инструмент за пътуване, работа, приятелства и нови възможности.
                    </p>
                    <p>
                        Предлагаме стандартни езикови курсове, както и сугестопедични обучения, които превръщат ученето
                        в по-леко, естествено и вдъхновяващо преживяване. Елате при нас и станете част от свят, в който
                        всяка нова дума отваря нова врата.
                    </p>
                    <div className="about-stats">
                        <div>
                            <strong>A1-C2</strong>
                            <span>нива на обучение</span>
                        </div>
                        <div>
                            <strong>2023</strong>
                            <span>година на създаване</span>
                        </div>
                        <div>
                            <strong>2</strong>
                            <span>стандартни и сугестопедични курсове</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
