import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { platformApi } from '../api/platformApi.ts';
import { onSessionChange, readSession, type AuthSession } from '../auth.ts';
import { BrandLogo } from '../components/BrandLogo.tsx';
import type { Course, CreateMemberDTO, Enrollment, Member, MemberLevel, Training } from '../../../types/platform.ts';

interface SignupForm {
    full_name: string;
    email: string;
    phone: string;
    level: MemberLevel;
}

interface PaymentForm {
    cardHolder: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
}

const emptySignup: SignupForm = {
    full_name: '',
    email: '',
    phone: '',
    level: 'A1',
};

const emptyPayment: PaymentForm = {
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
};

const formatMoney = (value: unknown): string => `${Number(value).toFixed(2)} лв.`;

const today = () => new Date().toISOString().slice(0, 10);

const digitsOnly = (value: string): string => value.replace(/\D/g, '');

const formatCardNumber = (value: string): string => {
    return digitsOnly(value)
        .slice(0, 16)
        .replace(/(.{4})/g, '$1 ')
        .trim();
};

const formatExpiry = (value: string): string => {
    const digits = digitsOnly(value).slice(0, 4);
    if (digits.length <= 2) {
        return digits;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const previewCardNumber = (value: string): string => {
    const formatted = formatCardNumber(value);
    return formatted || '•••• •••• •••• ••••';
};

const formatClientDateTime = (value: unknown): string => {
    if (!value) {
        return '-';
    }
    return new Intl.DateTimeFormat('bg-BG', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(String(value)));
};

const getMessage = (error: unknown): string => {
    if (error instanceof Error && error.message.includes("Cannot find module '../encodings'")) {
        return 'Backend зависимостите не са инсталирани коректно. Изпълнете npm install в основната папка и стартирайте сървъра отново.';
    }
    return error instanceof Error ? error.message : 'Възникна грешка при изпращане на заявката.';
};

export const ClientPortal = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [languageFilter, setLanguageFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    const [form, setForm] = useState<SignupForm>(emptySignup);
    const [paymentForm, setPaymentForm] = useState<PaymentForm>(emptyPayment);
    const [currentUser, setCurrentUser] = useState<AuthSession | null>(() => readSession());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadClientData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [courseData, trainingData, memberData, enrollmentData] = await Promise.all([
                platformApi.courses.list(),
                platformApi.trainings.list(),
                platformApi.members.list(),
                platformApi.enrollments.list(),
            ]);
            setCourses(courseData);
            setTrainings(trainingData);
            setMembers(memberData);
            setEnrollments(enrollmentData);
            setSelectedCourseId((current) => current ?? courseData[0]?.id ?? null);
        } catch (requestError) {
            setError(getMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadClientData();
    }, [loadClientData]);

    useEffect(() => {
        return onSessionChange(() => setCurrentUser(readSession()));
    }, []);

    const languages = useMemo(() => {
        return Array.from(new Set(courses.map((course) => course.language)));
    }, [courses]);

    const levels = useMemo(() => {
        return Array.from(new Set(courses.map((course) => course.level)));
    }, [courses]);

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesLanguage = languageFilter === 'all' || course.language === languageFilter;
            const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
            return matchesLanguage && matchesLevel;
        });
    }, [courses, languageFilter, levelFilter]);

    useEffect(() => {
        if (!filteredCourses.length) {
            setSelectedCourseId(null);
            return;
        }
        const selectedIsVisible = filteredCourses.some((course) => course.id === selectedCourseId);
        if (!selectedIsVisible) {
            setSelectedCourseId(filteredCourses[0].id);
        }
    }, [filteredCourses, selectedCourseId]);

    const selectedCourse = useMemo(() => {
        return courses.find((course) => course.id === selectedCourseId) ?? null;
    }, [courses, selectedCourseId]);

    const firstInstallmentAmount = useMemo(() => {
        if (!selectedCourse) {
            return 0;
        }
        return Number(selectedCourse.price) / 2;
    }, [selectedCourse]);

    const selectedCourseTrainings = useMemo(() => {
        if (!selectedCourse) {
            return [];
        }
        return trainings
            .filter((training) => training.course_id === selectedCourse.id)
            .sort((first, second) => {
                return new Date(String(first.starts_at)).getTime() - new Date(String(second.starts_at)).getTime();
            });
    }, [selectedCourse, trainings]);

    useEffect(() => {
        if (selectedCourse) {
            setForm((current) => ({ ...current, level: selectedCourse.level }));
        }
    }, [selectedCourse]);

    const updateForm = (field: keyof SignupForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const updatePaymentForm = (field: keyof PaymentForm, value: string) => {
        setPaymentForm((current) => ({ ...current, [field]: value }));
    };

    const validatePayment = (): string => {
        const cardNumber = digitsOnly(paymentForm.cardNumber);
        const cvv = digitsOnly(paymentForm.cvv);
        const expiry = digitsOnly(paymentForm.expiry);

        if (!paymentForm.cardHolder.trim()) {
            return 'Въведете имената от картата.';
        }
        if (cardNumber.length < 13) {
            return 'Въведете валиден номер на карта.';
        }
        if (expiry.length !== 4) {
            return 'Въведете валиден срок на картата във формат MM/YY.';
        }
        const expiryMonth = Number(expiry.slice(0, 2));
        if (expiryMonth < 1 || expiryMonth > 12) {
            return 'Месецът на валидност трябва да е между 01 и 12.';
        }
        if (cvv.length < 3) {
            return 'Въведете валиден CVV код.';
        }

        return '';
    };

    const submitSignup = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedCourse) {
            setError('Изберете курс преди записване.');
            return;
        }
        if (!currentUser) {
            setError('Моля, влезте с клиентски профил, за да се запишете и платите вноска.');
            return;
        }
        if (currentUser.role !== 'client') {
            setError('Плащането през Courses е достъпно за клиентски профили. Админът може да управлява такси от Admin panel.');
            return;
        }

        const paymentError = validatePayment();
        if (paymentError) {
            setError(paymentError);
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const normalizedEmail = form.email.trim().toLowerCase();
            let member = members.find((currentMember) => currentMember.email.toLowerCase() === normalizedEmail);
            if (!member) {
                member = await platformApi.members.create(form as CreateMemberDTO);
                setMembers((currentMembers) => [...currentMembers, member as Member]);
            }

            const existingEnrollment = enrollments.find((enrollment) => {
                return enrollment.member_id === member?.id && enrollment.course_id === selectedCourse.id;
            });

            if (!existingEnrollment) {
                const createdEnrollment = await platformApi.enrollments.create({
                    member_id: member.id,
                    course_id: selectedCourse.id,
                    status: 'active',
                    enrolled_at: today(),
                });
                setEnrollments((currentEnrollments) => [...currentEnrollments, createdEnrollment]);
            }

            await platformApi.fees.create({
                course_id: selectedCourse.id,
                member_id: member.id,
                title: 'Първа вноска',
                amount: firstInstallmentAmount,
                due_date: today(),
                paid: true,
            });

            setSuccess(`Записването за "${selectedCourse.title}" е успешно и първата вноска е платена.`);
            setForm({ ...emptySignup, level: selectedCourse.level });
            setPaymentForm(emptyPayment);
        } catch (submitError) {
            setError(getMessage(submitError));
        } finally {
            setSubmitting(false);
        }
    };

    const cardHolderPreview = paymentForm.cardHolder.trim() || form.full_name.trim() || currentUser?.username || 'Име Фамилия';
    const expiryPreview = paymentForm.expiry || 'MM/YY';

    return (
        <div className="client-page">
            <section className="client-intro">
                <div>
                    <p className="eyebrow">Клиентска версия</p>
                    <h1><BrandLogo className="title-brand" /></h1>
                    <p className="lead">Изберете курс, вижте графика и платете първа вноска директно от клиентския профил.</p>
                </div>
                <div className="client-highlights" aria-label="Предимства">
                    <span>Малки групи</span>
                    <span>Нива A1-C2</span>
                    <span>Онлайн и присъствено</span>
                </div>
            </section>

            <section className="client-workspace">
                <div className="client-toolbar">
                    <div>
                        <p className="eyebrow">Каталог</p>
                        <h2>Курсове</h2>
                    </div>
                    <div className="client-filters">
                        <label>
                            <span>Език</span>
                            <select value={languageFilter} onChange={(event) => setLanguageFilter(event.target.value)}>
                                <option value="all">Всички</option>
                                {languages.map((language) => (
                                    <option key={language} value={language}>{language}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span>Ниво</span>
                            <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
                                <option value="all">Всички</option>
                                {levels.map((level) => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {error ? <p className="notice error">{error}</p> : null}
                {success ? <p className="notice success">{success}</p> : null}

                <div className="client-layout">
                    <div className="course-catalog">
                        {loading ? (
                            [1, 2, 3].map((item) => (
                                <article className="course-card skeleton-card" key={item} aria-label="Зареждане" />
                            ))
                        ) : filteredCourses.length ? filteredCourses.map((course) => (
                            <article
                                className={selectedCourseId === course.id ? 'course-card selected' : 'course-card'}
                                key={course.id}
                            >
                                <div className="course-card-head">
                                    <span className="badge level-badge">{course.level}</span>
                                    <strong>{formatMoney(course.price)}</strong>
                                </div>
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                                <div className="course-meta">
                                    <span>{course.language}</span>
                                    <span>{course.duration_weeks} седмици</span>
                                </div>
                                <button onClick={() => setSelectedCourseId(course.id)} type="button">
                                    {selectedCourseId === course.id ? 'Избран' : 'Избери'}
                                </button>
                            </article>
                        )) : (
                            <p className="empty-state">Няма курсове по избраните филтри.</p>
                        )}
                    </div>

                    <aside className="signup-panel">
                        {selectedCourse ? (
                            <>
                                <span className="badge level-badge">{selectedCourse.language} {selectedCourse.level}</span>
                                <h2>{selectedCourse.title}</h2>
                                <p>{selectedCourse.description}</p>

                                <div className="client-schedule">
                                    <h3>График</h3>
                                    {selectedCourseTrainings.length ? selectedCourseTrainings.map((training) => (
                                        <div className="schedule-item" key={training.id}>
                                            <strong>{formatClientDateTime(training.starts_at)}</strong>
                                            <span>{training.trainer_name} / {training.room}</span>
                                        </div>
                                    )) : (
                                        <p className="empty-state compact">Очаквайте график.</p>
                                    )}
                                </div>

                                {!currentUser ? (
                                    <div className="client-auth-callout">
                                        <h3>Влезте, за да се запишете</h3>
                                        <p>Курсовете са видими за всички, но записването и плащането са достъпни след вход с клиентски профил.</p>
                                        <button className="primary-action" onClick={() => navigate('/')} type="button">
                                            Вход / Регистрация
                                        </button>
                                    </div>
                                ) : currentUser.role !== 'client' ? (
                                    <div className="client-auth-callout">
                                        <h3>Административен профил</h3>
                                        <p>В момента сте влезли като админ. Клиентските записвания и картови плащания се правят от клиентски профил.</p>
                                        <button className="ghost-action" onClick={() => navigate('/admin')} type="button">
                                            Към Admin panel
                                        </button>
                                    </div>
                                ) : (
                                    <form className="client-form checkout-form" onSubmit={submitSignup}>
                                        <div className="payment-summary">
                                            <span>Първа вноска</span>
                                            <strong>{formatMoney(firstInstallmentAmount)}</strong>
                                            <small>Оставаща сума: {formatMoney(Number(selectedCourse.price) - firstInstallmentAmount)}</small>
                                        </div>

                                        <label>
                                            <span>Име</span>
                                            <input
                                                required
                                                value={form.full_name}
                                                onChange={(event) => updateForm('full_name', event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            <span>Имейл</span>
                                            <input
                                                required
                                                type="email"
                                                value={form.email}
                                                onChange={(event) => updateForm('email', event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            <span>Телефон</span>
                                            <input
                                                required
                                                value={form.phone}
                                                onChange={(event) => updateForm('phone', event.target.value)}
                                            />
                                        </label>
                                        <label>
                                            <span>Текущо ниво</span>
                                            <select
                                                value={form.level}
                                                onChange={(event) => updateForm('level', event.target.value)}
                                            >
                                                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                                                    <option key={level} value={level}>{level}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <div className="payment-card-preview" aria-label="Преглед на дебитна или кредитна карта">
                                            <div className="payment-card-top">
                                                <span className="card-chip" />
                                                <div className="card-logos" aria-label="Visa и MasterCard">
                                                    <span className="visa-logo">VISA</span>
                                                    <span className="mastercard-logo">
                                                        <span />
                                                        <span />
                                                    </span>
                                                </div>
                                            </div>
                                            <strong>{previewCardNumber(paymentForm.cardNumber)}</strong>
                                            <div className="payment-card-bottom">
                                                <span>{cardHolderPreview}</span>
                                                <span>{expiryPreview}</span>
                                            </div>
                                        </div>

                                        <div className="payment-fields">
                                            <label className="full-field">
                                                <span>Имена върху картата</span>
                                                <input
                                                    autoComplete="cc-name"
                                                    required
                                                    value={paymentForm.cardHolder}
                                                    onChange={(event) => updatePaymentForm('cardHolder', event.target.value)}
                                                />
                                            </label>
                                            <label className="full-field">
                                                <span>Номер на карта</span>
                                                <input
                                                    autoComplete="cc-number"
                                                    inputMode="numeric"
                                                    maxLength={19}
                                                    placeholder="4242 4242 4242 4242"
                                                    required
                                                    value={formatCardNumber(paymentForm.cardNumber)}
                                                    onChange={(event) => updatePaymentForm('cardNumber', digitsOnly(event.target.value).slice(0, 16))}
                                                />
                                            </label>
                                            <label>
                                                <span>Валидна до</span>
                                                <input
                                                    autoComplete="cc-exp"
                                                    inputMode="numeric"
                                                    maxLength={5}
                                                    placeholder="MM/YY"
                                                    required
                                                    value={paymentForm.expiry}
                                                    onChange={(event) => updatePaymentForm('expiry', formatExpiry(event.target.value))}
                                                />
                                            </label>
                                            <label>
                                                <span>Security PIN CVV</span>
                                                <input
                                                    autoComplete="cc-csc"
                                                    inputMode="numeric"
                                                    maxLength={4}
                                                    placeholder="123"
                                                    required
                                                    type="password"
                                                    value={paymentForm.cvv}
                                                    onChange={(event) => updatePaymentForm('cvv', digitsOnly(event.target.value).slice(0, 4))}
                                                />
                                            </label>
                                        </div>

                                        <button className="primary-action" disabled={submitting} type="submit">
                                            {submitting ? 'Обработка...' : 'Запиши се и плати вноска'}
                                        </button>
                                    </form>
                                )}
                            </>
                        ) : (
                            <p className="empty-state">Изберете курс от каталога.</p>
                        )}
                    </aside>
                </div>
            </section>
        </div>
    );
};
