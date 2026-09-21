import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Alert, Backdrop, Box, Button, Chip, CircularProgress, Container, FormControl, FormHelperText, FormLabel, Grid2, InputBase, Paper, Stack, TextField, Typography, alpha, inputBaseClasses, styled, useTheme } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import { acoLeadCrmShortLogo } from '../../assets';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { leadCaputureAddon, PlanType } from './license.types';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { MuiTelInput } from 'mui-tel-input';
import { PRODUCT_OPTIONS } from './constants';
import { cpcrmApi } from '../../redux/cpcrm.api';
import { APP_STORE_LINK, PLAY_STORE_LINK } from '../../components/StoreButtons';
import { checkIsAndroid, checkIsIOS } from '../../utils';
import { WarningAmberRounded } from '@mui/icons-material';

const ACOLEAD_CONTACT_NUMBER = '+919112614174';

const ACOLEAD_SUPPORT_EMAIL = 'info@coalitionify.com';

const acoleadcrmWebAppName = 'AcoLead';

export default function Signup() {
    const theme = useTheme();
    const location = useLocation();

    const { initialProduct } = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return {
            initialProduct: params.get("product") || null,
        }
    }, [location.search]);

    const [selectedModules, setSelectedModules] = useState(() => initialProduct ? [initialProduct] : []);
    const [feedback, setFeedback] = useState(null);

    const selectableProducts = useMemo(() => PRODUCT_OPTIONS.filter((p) => p.selectable), []);

    const toggleModule = useCallback((id) => {
        setSelectedModules((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
        );
        setFeedback(null);
    }, [setSelectedModules]);

    return (
        <Box
            sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                width: "100vw",
                height: "100vh",
            }}
        >
            <Container
                maxWidth="lg"
                sx={{
                    height: "100%",
                    minHeight: 0,
                    overflow: { xs: "auto", md: "hidden" },
                    display: "flex",
                    flexDirection: "column",
                    paddingY: 2,
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ flexShrink: 0, mb: 1 }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                    >
                        <Box component="img" src={acoLeadCrmShortLogo} alt="Acolead" sx={{ height: 40, objectFit: 'contain' }} />
                        <Typography color='primary' variant='h5' fontWeight={600}>{acoleadcrmWebAppName}</Typography>
                    </Stack>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <HelpLinks />
                    </Box>
                </Stack>
                <Box
                    flex={1}
                    sx={{
                        minHeight: { xs: undefined, md: 0 },
                    }}
                >
                    <Grid2
                        container
                        spacing={2}
                        sx={{
                            width: "100%",
                            height: "100%",
                            minHeight: 0,
                            overflow: { xs: "auto", md: "hidden" },
                        }}
                    >
                        <Grid2
                            container
                            flexDirection={"column"}
                            spacing={0.75}
                            size={{ xs: 12, md: 7 }}
                            sx={{
                                height: { xs: undefined, md: "100%" },
                                minHeight: { xs: undefined, md: 0 },
                            }}
                        >
                            <Box sx={{ flexShrink: 0 }}>
                                <Typography variant="h6" fontWeight={800} lineHeight={1.2} sx={{ mb: 0.25 }}>
                                    Welcome,
                                </Typography>
                                <Typography variant="body2" color="text.secondary" lineHeight={1.4} display="block">
                                    Select products to activate — multi‑select supported.
                                </Typography>
                            </Box>

                            {feedback && (
                                <Alert
                                    severity={feedback.type}
                                    onClose={() => setFeedback(null)}
                                    sx={{
                                        py: 0,
                                        flexShrink: 0,
                                        borderRadius: 1,
                                        '& .MuiAlert-message': { py: 0.5 },
                                    }}
                                >
                                    {feedback.message}
                                </Alert>
                            )}

                            <Stack
                                spacing={0.85}
                                sx={{
                                    flex: 1,
                                    minHeight: { xs: undefined, md: 0 },
                                    overflowY: {
                                        xs: "visible",
                                        md: "auto",
                                    },
                                    py: 0.25,
                                    pr: 0.25,
                                    '&::-webkit-scrollbar': {
                                        width: 4,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        bgcolor: 'divider',
                                        borderRadius: 2,
                                    },
                                }}
                            >
                                {selectableProducts.map((option) => (
                                    <ProductCard
                                        key={option.id}
                                        option={option}
                                        selected={
                                            option.selectable
                                                ? selectedModules.includes(option.id)
                                                : false
                                        }
                                        onToggle={() => toggleModule(option.id)}
                                    />
                                ))}
                            </Stack>
                        </Grid2>
                        <Grid2
                            container
                            flexDirection={"column"}
                            spacing={0.75}
                            size={{ xs: 12, md: 5 }}
                            sx={{
                                height: { xs: undefined, md: "100%" },
                                minHeight: { xs: undefined, md: 0 },
                            }}
                        >
                            <RegistrationForm features={selectedModules} />
                        </Grid2>
                    </Grid2>
                </Box>
                <Box sx={{ display: { xs: 'block', md: 'none' }, paddingTop: 2 }}>
                    <HelpLinks />
                </Box>
            </Container>
        </Box>
    );
}

const RegistrationForm = forwardRef(({ features }, ref) => {
    const theme = useTheme();
    const primary = theme.palette.primary.main;

    const [otpSent, setOtpSent] = useState(false);
    const [isMobileVerified, setIsMobileVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [apiSuccess, setApiSuccess] = useState(null);
    const [isGuestUser, setIsGuestUser] = useState(true);
    const [accessToken, setAccessToken] = useState(null);
    const [isWebsiteExist, setIsWebsiteExist] = useState(false);

    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);

    const errorRef = useRef(null);
    const successRef = useRef(null);

    const [sendOtp] = cpcrmApi.useSendOtpMutation();
    const [resendOtp] = cpcrmApi.useResendOtpMutation();
    const [verifyOtp] = cpcrmApi.useVerifyOtpMutation();

    const formik = useFormik({
        enableReinitialize: true,
        validateOnChange: true,
        initialValues: {
            mobileNumber: '',
            fullName: '',
            firmName: '',
            otp: '',
        },
        validationSchema: yup.object().shape({
            mobileNumber: yup.string().trim()
                .required('Mobile number is required')
                .matches(/^\+91[6-9]\d{9}$/, `Enter a valid mobile number`),
            firmName: yup.string().trim().when({
                is: () => !otpSent,
                then: (schema) => schema.required('Firm name is required'),
            }),
            fullName: yup.string().trim().when({
                is: () => !otpSent,
                then: (schema) => schema.required('Full name is required'),
            }),
            // otp: yup.string().trim().when({
            //     is: () => otpSent,
            //     then: (schema) =>
            //         schema
            //             .required('OTP is required')
            //             .length(6, 'OTP must be exactly 6 digits')
            //             .matches(/^\d+$/, 'OTP must contain only digits'),
            // }),
            website: yup.string().trim().when({
                is: () => isWebsiteExist,
                then: (schema) => schema.test(
                    'valid-website',
                    'Website can only contain letters, numbers, spaces and hyphens',
                    (value) => {
                        if (!value) return true;
                        const trimmed = value.trim();

                        const normalized = trimmed
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, '-')
                            .replace(/-+/g, '-')
                            .replace(/^-|-$/g, '');

                        // Ignore casing, but ensure no other characters need normalization
                        return trimmed.toLowerCase() === normalized;
                    }
                ),
            }),
        }),
        onSubmit: () => { },
    });

    const { values } = formik;

    const { baseDomain, websiteUrl } = useMemo(() => {
        const siteName = (isWebsiteExist ? values.website : values.firmName).trim();
        if (!siteName) return '';
        const baseDomain = siteName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return { baseDomain, websiteUrl: `${baseDomain}.acolead.com` };
    }, [isWebsiteExist, values.website, values.firmName]);

    useEffect(() => {
        let interval = null;

        if (timer > 0) interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        setApiError(null);
        setApiSuccess(null);

        try {
            const body = {
                mobileNumber: formik.values.mobileNumber,
                fullName: formik.values.fullName,
                firmName: formik.values.firmName,
            };
            const result = await sendOtp({ body }).unwrap();
            if (result?.otp) {
                try {
                    await navigator.clipboard.writeText(String(result.otp));
                } catch (err) {
                    console.error('Failed to copy OTP:', err);
                }
            }
            setIsGuestUser(result.guestUser);
            setAccessToken(result.accessToken);
            setOtpSent(true);
            setTimer(30);
            setCanResend(false);
            setApiSuccess('OTP sent to your mobile number.');
            setTimeout(() => setApiSuccess(null), 2000);
        } catch (err) {
            if (!!err?.data?.errors?.length) {
                err.data.errors.forEach((error) => {
                    if (error?.property in formik.values) formik.setFieldError(error?.property, error?.message);
                });
            } else if (err?.data?.message) {
                setApiError(err.data.message);
                window.requestAnimationFrame(() => {
                    if (errorRef.current) errorRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                });
            }
        } finally {
            setIsSendingOtp(false);
            formik.setFieldValue("otp", "");
        }
    };

    const handleResendOtp = async () => {
        if (!canResend || !accessToken) return;

        setIsSendingOtp(true);
        setApiError(null);
        setApiSuccess(null);

        try {
            const body = { accessToken };
            const result = await resendOtp({ body }).unwrap();
            if (result?.otp) {
                try {
                    await navigator.clipboard.writeText(String(result.otp));
                } catch (err) {
                    console.error('Failed to copy OTP:', err);
                }
            }
            setOtpSent(true);
            setTimer(30);
            setCanResend(false);
            setApiSuccess('OTP resent successfully.');
            setTimeout(() => setApiSuccess(null), 2000);
        } catch (err) {
            if (!!err?.data?.errors?.length) {
                err.data.errors.forEach((error) => {
                    if (error?.property in formik.values) formik.setFieldError(error?.property, error?.message);
                });
            } else if (err?.data?.message) {
                setApiError(err.data.message);
                window.requestAnimationFrame(() => {
                    if (errorRef.current) errorRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                });
            }
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleDeepLink = (result, resetForm) => {
        const params = new URLSearchParams(result.tokens);
        const deepLinkUrl = `acolead://auth?${params.toString()}`;
        const crmUrl = `${process.env.NODE_ENV === "development" ? `http://localhost:4600` : `https://${result.crmDomain}`}?${params.toString()}`;

        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isIOS = checkIsIOS(userAgent);
        const isAndroid = checkIsAndroid(userAgent);
        const isMobile = isIOS || isAndroid;

        // Give user option to choose
        if (isMobile) {
            // Show a small modal/banner asking user what they want to do
            const userChoice = window.confirm(
                'Open in App or continue on web?',
                'Open App', 'Continue on Web'
            );

            if (userChoice) {
                // User wants to open app
                let appOpened = false;
                window.location.href = deepLinkUrl;

                const timeout = setTimeout(() => {
                    if (!appOpened) {
                        // App not installed - go to store
                        // storeUrl = `market://details?id=com.acolead`;
                        const storeUrl = isIOS ? APP_STORE_LINK : PLAY_STORE_LINK;
                        window.location.replace(storeUrl);
                    }
                }, 2500);

                const handleVisibilityChange = () => {
                    if (document.hidden) {
                        appOpened = true;
                        clearTimeout(timeout);
                        document.removeEventListener('visibilitychange', handleVisibilityChange);
                    }
                };
                document.addEventListener('visibilitychange', handleVisibilityChange);

                const handlePageHide = () => {
                    appOpened = true;
                    clearTimeout(timeout);
                    window.removeEventListener('pagehide', handlePageHide);
                };
                window.addEventListener('pagehide', handlePageHide);
            } else {
                // User wants web version
                window.location.replace(crmUrl);
            }
        } else {
            // Desktop
            window.location.replace(crmUrl);
        }
    };

    const handleVerifyOtp = async () => {
        setIsVerifying(true);
        setApiError(null);
        setApiSuccess(null);

        try {
            const body = {
                fullName: formik.values.fullName,
                firmName: formik.values.firmName,
                accessToken,
                otp: formik.values.otp,
                features,
            };
            if (isWebsiteExist) body.website = baseDomain;
            const result = await verifyOtp({ body }).unwrap();
            handleDeepLink(result, formik.resetForm);
        } catch (err) {
            if (err?.data?.code === "SITE_ALREADY_EXIST") {
                setIsWebsiteExist(true);
                formik.setFieldValue("website", baseDomain);
                // formik.setFieldTouched("website", true);
                // formik.setFieldError("website", "Website already exist create with new prefix");
            } else if (!!err?.data?.errors?.length) {
                err.data.errors.forEach((error) => {
                    if (error?.property in formik.values) formik.setFieldError(error?.property, error?.message);
                });
            } else if (err?.data?.message) {
                setApiError(err.data.message);
                window.requestAnimationFrame(() => {
                    if (errorRef.current) errorRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                });
            }
            setIsVerifying(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0
            ? `${mins}:${secs.toString().padStart(2, '0')}`
            : `${secs}s`;
    };

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                overflow: 'hidden',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: alpha(primary, 0.2),
                background: `linear-gradient(160deg, ${alpha(primary, 0.12)} 0%, ${alpha('#fff', 0.92)} 38%, ${alpha(primary, 0.04)} 100%)`,
                boxShadow: `0 8px 32px ${alpha(primary, 0.1)}`,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${primary}, ${alpha(primary, 0.45)})`,
                    borderRadius: '10px 10px 0 0',
                },
            }}
        >
            <Backdrop
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                }}
                open={isVerifying}
            >
                <CircularProgress size={60} sx={{ color: "white" }} />
            </Backdrop>
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    p: 2,
                    pt: 2.25,
                }}
            >
                <Stack spacing={1.5} sx={{ flexShrink: 0 }}>
                    <Chip
                        icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                        label="Registration"
                        size="small"
                        sx={{
                            alignSelf: 'flex-start',
                            height: 24,
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            bgcolor: alpha(primary, 0.12),
                            color: 'primary.main',
                            border: '1px solid',
                            borderColor: alpha(primary, 0.2),
                            '& .MuiChip-icon': { color: 'primary.main' },
                        }}
                    />

                    <Box>
                        <Typography variant="h6" fontWeight={800} lineHeight={1.2} letterSpacing="-0.01em">
                            Complete Your Profile
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500} lineHeight={1.4} mt={0.5}>
                            Verify your mobile number to start your free trial.
                        </Typography>
                    </Box>
                </Stack>

                <Stack
                    spacing={2}
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        mt: 2,
                        mb: 1.5,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        pr: 0.5,
                        '&::-webkit-scrollbar': { width: 4 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: alpha(primary, 0.2), borderRadius: 2 },
                    }}
                >
                    <Stack>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: undefined, sm: "flex-start" }}>
                            <Box sx={{ flex: 1 }}>
                                <FormField
                                    fieldLabel="Mobile Number"
                                    fullWidth
                                    theme={theme}
                                    formikProps={formik}
                                    fieldName="mobileNumber"
                                    fieldConfig={{
                                        type: "tel",
                                        required: true,
                                        placeholder: "10-digit mobile",
                                        disabled: isMobileVerified || otpSent,
                                        autoFocus: true,
                                    }}
                                />
                            </Box>
                            {!isMobileVerified && (
                                <Box sx={{ pt: { xs: 0, sm: 3.3 } }}>
                                    {!otpSent ? (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleSendOtp}
                                            disabled={!features.length || isSendingOtp || !!formik.errors.mobileNumber}
                                            loading={isSendingOtp}
                                            sx={{
                                                borderRadius: 1.5,
                                                fontWeight: 600,
                                                borderColor: primary,
                                                color: primary,
                                                px: 2,
                                                py: 1.35,
                                                whiteSpace: 'nowrap',
                                                '&:hover': {
                                                    borderColor: theme.palette.background.hover,
                                                    bgcolor: alpha(primary, 0.04)
                                                },
                                            }}
                                        >
                                            Send OTP
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant="text"
                                            onClick={handleResendOtp}
                                            disabled={!features.length || isSendingOtp || !canResend}
                                            loading={isSendingOtp}
                                            sx={{
                                                borderRadius: 1.5,
                                                fontWeight: canResend ? 600 : 500,
                                                color: canResend ? primary : 'text.disabled',
                                                px: 2,
                                                py: 1.35,
                                                whiteSpace: 'nowrap',
                                                minWidth: '100px',
                                                textTransform: "none",
                                            }}
                                        >
                                            {canResend ? (
                                                'Resend OTP'
                                            ) : (
                                                `Resend in ${formatTime(timer)}`
                                            )}
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </Stack>
                        {isMobileVerified && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
                                <CheckCircleIcon sx={{ color: "success.main", fontSize: 20, mr: 0.5 }} />
                                <Typography variant="body2" color="success.main" fontWeight={600}>
                                    Mobile number verified successfully
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {accessToken && (
                        <>
                            {isGuestUser && (
                                <>
                                    <FormField
                                        fieldLabel="Firm Name"
                                        fullWidth
                                        theme={theme}
                                        formikProps={formik}
                                        fieldName="firmName"
                                        fieldConfig={{
                                            disabled: isWebsiteExist,
                                            required: true,
                                            placeholder: "What is your firm name ?",
                                            helperText: isWebsiteExist ? undefined : websiteUrl ? `Your site URL: ${websiteUrl}` : 'Enter firm name to generate URL',
                                        }}
                                    />

                                    {isWebsiteExist && (
                                        <Stack>
                                            <FormField
                                                fieldLabel="Website URL"
                                                fullWidth
                                                theme={theme}
                                                formikProps={formik}
                                                fieldName="website"
                                                fieldConfig={{
                                                    required: true,
                                                    placeholder: "What should be your website prefix ?",
                                                    helperText: `Your site URL: ${websiteUrl}`,
                                                }}
                                            />
                                            <FormHelperText
                                                children="Website already exist create with new prefix"
                                                error={true}
                                            />
                                        </Stack>
                                    )}

                                    <FormField
                                        fieldLabel="Full Name"
                                        fullWidth
                                        theme={theme}
                                        formikProps={formik}
                                        fieldName="fullName"
                                        fieldConfig={{
                                            required: true,
                                            placeholder: "What is your full name ?",
                                        }}
                                    />
                                </>
                            )}

                            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                                <FormField
                                    fieldLabel="Enter OTP"
                                    fullWidth
                                    theme={theme}
                                    formikProps={formik}
                                    fieldName="otp"
                                    fieldConfig={{
                                        type: "otp",
                                        required: true,
                                        placeholder: "6-digit OTP",
                                        length: 6,
                                        autoFocus: false,
                                    }}
                                />
                                <Button
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    onClick={handleVerifyOtp}
                                    disabled={!features.length || isVerifying || !formik.isValid || formik.values.otp?.length < 6}
                                    loading={isVerifying}
                                    sx={{
                                        borderRadius: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.25,
                                    }}
                                >
                                    Verify OTP
                                </Button>
                            </Stack>

                            {apiError && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mt: 1.5,
                                        borderRadius: 1.5,
                                        '& .MuiAlert-message': { fontSize: '0.875rem' },
                                    }}
                                    onClose={() => setApiError(null)}
                                    ref={errorRef}
                                >
                                    {apiError}
                                </Alert>
                            )}
                            {apiSuccess && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        mt: 1.5,
                                        borderRadius: 1.5,
                                        '& .MuiAlert-message': { fontSize: '0.875rem' },
                                    }}
                                    onClose={() => setApiSuccess(null)}
                                    ref={successRef}
                                >
                                    {apiSuccess}
                                </Alert>
                            )}
                        </>
                    )}
                </Stack>
                {!features.length && (
                    <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'rgba(245, 158, 11, 0.3)',
                            backgroundColor: 'rgba(245, 158, 11, 0.06)',
                            // visibility: !features.length ? "visible" : "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#d97706',
                                flexShrink: 0,
                            }}
                        >
                            <WarningAmberRounded sx={{ fontSize: 16 }} />
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: '#b45309',
                                letterSpacing: '-0.005em',
                                lineHeight: 1.4,
                            }}
                        >
                            No product selected.{' '}
                            Select at least 1 to proceed.
                        </Typography>
                    </Stack>
                )}
            </Box>

            {/* <Box
                    sx={{
                        flexShrink: 0,
                        p: 2,
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: alpha(primary, 0.12),
                        bgcolor: alpha(theme.palette.background.paper, 0.72),
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <Typography
                        variant="body2"
                        color={isValid && isMobileVerified ? 'success.main' : 'text.secondary'}
                        fontWeight={isValid && isMobileVerified ? 600 : 400}
                        sx={{ mb: 0.5 }}
                    >
                        {isValid && isMobileVerified
                            ? '✓ All set! You can now start your free trial.'
                            : 'Please fill all required fields and verify your mobile.'}
                    </Typography>
                </Box> */}
        </Paper>
    );
});

function HelpLinks() {
    return (
        <Typography variant="caption" color="text.secondary" noWrap >
            Help:{' '}
            <Box
                component="a"
                href={`tel:${ACOLEAD_CONTACT_NUMBER}`}
                sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', typography: "inherit" }}
            >
                {ACOLEAD_CONTACT_NUMBER}
            </Box>
            {' · '}
            <Box
                component="a"
                href={`mailto:${ACOLEAD_SUPPORT_EMAIL}`}
                sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', typography: "inherit" }}
            >
                {ACOLEAD_SUPPORT_EMAIL}
            </Box>
        </Typography>
    );
}

function ProductLogo({ option }) {
    if (option.logoSrc) return (
        <Box
            component="img"
            src={option.logoSrc}
            alt=""
            sx={{ width: option.iconSize?.registerPageCard, height: option.iconSize?.registerPageCard, objectFit: 'contain' }}
        />
    );
    return option?.logo({ size: option.iconSize?.registerPageCard }) || null;
}

function ProductCard({
    option,
    selected,
    onToggle,
}) {
    const theme = useTheme();
    const isSelectable = option.selectable && !option.comingSoon;
    const accent = option.accent ?? theme.palette.primary.main;

    return (
        <Paper
            component={isSelectable ? 'button' : 'div'}
            type={isSelectable ? 'button' : undefined}
            onClick={isSelectable ? onToggle : undefined}
            elevation={0}
            sx={{
                position: 'relative',
                width: '100%',
                textAlign: 'left',
                cursor: isSelectable ? 'pointer' : 'default',
                borderRadius: 2,
                border: '1.5px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                opacity: option.comingSoon ? 0.7 : 1,
                transition: 'all 0.2s ease',
                p: 2,
                '&:hover': isSelectable ? {
                    borderColor: selected ? 'primary.main' : 'primary.main',
                    bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : alpha(theme.palette.primary.main, 0.02),
                    boxShadow: 'none',
                } : {},
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box
                    sx={{
                        width: 55,
                        height: 55,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: selected ? alpha(accent, 0.12) : alpha(accent, 0.08),
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                    }}
                >
                    <ProductLogo option={option} />
                </Box>

                <Stack sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="body1"
                        fontWeight={600}
                        color={selected ? 'primary.main' : 'text.primary'}
                        sx={{ mb: 1 }}
                    >
                        {option.label}
                    </Typography>

                    <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 0.4,
                        }}
                    >
                        {option.tagline}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 0.5,
                        }}
                    >
                        {option.description}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="success.main"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {option.trialLabel}
                    </Typography>
                </Stack>

                {selected && (
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: selected ? 'primary.main' : 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                            bgcolor: selected ? 'primary.main' : 'transparent',
                        }}
                    >
                        <CheckCircleIcon
                            sx={{
                                fontSize: 14,
                                color: '#fff',
                            }}
                        />
                    </Box>
                )}
            </Stack>

            {option.comingSoon && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: 'warning.main',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    Coming soon
                </Box>
            )}
        </Paper>
    );
}

const FormField = ({
    fieldLabel,
    children,
    theme,
    formikProps,
    fieldName,
    fieldConfig,
    fullWidth,
    hideLabel = false,
    ...rest
}) => {
    const { value, touched, error } = formikProps.getFieldMeta(fieldName);

    if (fieldConfig?.type === "otp") return (
        <Stack>
            {!hideLabel && <FormLabel children={fieldLabel} required={fieldConfig?.required} sx={{ typography: "body2", marginBottom: 0.5 }} />}
            <CustomOTPInput
                fullWidth
                {...formikProps.getFieldProps(fieldName)}
                onBlur={() => formikProps.setFieldTouched(fieldName, true)}
                value={value ?? ""}
                error={touched && !!error}
                length={Number(fieldConfig?.length ?? 6)}
                borderRadius={2}
                backgroundColor={"background.paper"}
                autoFocus={fieldConfig?.autoFocus}
            />
            <FormHelperText
                error={touched && !!error}
                children={touched && !!error ? error : fieldConfig?.helperText}
            />
        </Stack>
    );

    return (
        <FormControl fullWidth={fullWidth}>
            {!hideLabel && <FormLabel children={fieldLabel} required={fieldConfig?.required} sx={{ typography: "body2", marginBottom: 0.5 }} />}
            {children ? (
                children({
                    theme,
                    formikProps,
                    fieldName,
                    fieldConfig,
                    fullWidth,
                    hideLabel,
                    ...rest
                })
            ) : fieldConfig?.type === "tel" ? (
                <OutlinedTelInput
                    fullWidth
                    {...formikProps.getFieldProps(fieldName)}
                    value={value ?? ""}
                    onChange={(value) => formikProps.setFieldValue(fieldName, value)}
                    error={touched && !!error}
                    helperText={touched && !!error ? error : fieldConfig?.helperText}
                    slotProps={{
                        input: {
                            readOnly: fieldConfig?.readOnly,
                            autoFocus: fieldConfig?.autoFocus,
                        },
                    }}
                    disableDropdown={fieldConfig?.readOnly}
                    disableFormatting
                    disabled={fieldConfig?.disabled}
                    onlyCountries={["IN"]}
                    border
                    borderRadius={8}
                    backgroundColor={"background.paper"}
                />
            ) : (
                <OutlinedTextField
                    fullWidth
                    {...formikProps.getFieldProps(fieldName)}
                    value={value ?? ""}
                    error={touched && !!error}
                    helperText={touched && !!error ? error : fieldConfig?.helperText}
                    slotProps={{
                        input: {
                            type: fieldConfig?.type,
                            readOnly: fieldConfig?.readOnly,
                            autoFocus: fieldConfig?.autoFocus,
                        }
                    }}
                    placeholder={fieldConfig?.placeholder}
                    disabled={fieldConfig?.disabled}
                    border
                    borderRadius={8}
                    backgroundColor={"background.paper"}
                />
            )}
        </FormControl>
    );
}

const OutlinedTextField = styled(({
    border,
    padding,
    borderRadius,
    ...props
}) => (
    <TextField variant="outlined" {...props} />
), {
    shouldForwardProp: (prop) => !['border', 'padding', 'borderRadius', 'backgroundColor'].includes(prop),
})(({ theme, border, padding, borderRadius, backgroundColor }) => ({
    borderRadius: borderRadius ?? theme.shape.borderRadius,
    '& .MuiInputBase-root': {
        padding,
        border: 'none',
        backgroundColor: backgroundColor ?? theme.palette.grey[100],
        borderRadius: borderRadius ?? theme.shape.borderRadius,
        '&::before, &::after': {
            border: 'none',
        },
        '&::placeholder': {
            opacity: 0.7,
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: border ? `1px solid ${theme.palette.divider} !important` : 'none',
        borderRadius: borderRadius ?? theme.shape.borderRadius,
    },
    '& .MuiInputAdornment-positionStart': {
        color: theme.palette.primary.main,
    },
}));

const OutlinedTelInput = styled(({
    value,
    border,
    padding,
    borderRadius,
    ...props
}) => (
    <MuiTelInput
        forceCallingCode={true}
        defaultCountry="IN"
        disableFormatting={true}
        value={value == null ? '' : String(value)}
        {...props}
    />
), {
    shouldForwardProp: (prop) => !['border', 'padding', 'borderRadius', 'backgroundColor'].includes(prop),
})(({ theme, border, padding, borderRadius, backgroundColor }) => ({
    borderRadius: borderRadius ?? theme.shape.borderRadius,
    '& .MuiInputBase-root': {
        padding,
        border: 'none',
        backgroundColor: backgroundColor ?? theme.palette.grey[100],
        borderRadius: borderRadius ?? theme.shape.borderRadius,
        '&::before, &::after': {
            border: 'none',
        },
        '&::placeholder': {
            opacity: 0.7,
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: border ? `1px solid ${theme.palette.divider} !important` : 'none',
        borderRadius: borderRadius ?? theme.shape.borderRadius,
    },
    '& .MuiInputAdornment-positionStart': {
        color: theme.palette.primary.main,
    },
}));

const EMPTY_STRING = '';

const CustomOTPInput = forwardRef(
    ({ length, value, onChange, onKeyDown, variant, onBlur, autoFocus = true, border, padding, borderRadius, backgroundColor, ...props }, ref) => {
        const theme = useTheme();

        const inputRefs = useRef(Array(length).fill(null));

        useEffect(() => { autoFocus && focusInput(0); }, [autoFocus]);

        const focusInput = useCallback((index) => {
            const target = inputRefs.current[index];
            target?.focus();
        }, []);

        const selectInput = useCallback((index) => {
            const target = inputRefs.current[index];
            target?.select();
        }, []);

        const updateValue = useCallback((newValue) => {
            onChange?.({ target: { name: props.name, value: newValue } });
        }, [props.name, onChange]);

        const handleChange = useCallback((event, index) => {
            const currentValue = event.target.value;
            if (/^\d$/.test(currentValue)) {
                const newValue = value.substring(0, index) + currentValue + value.substring(index + 1);

                updateValue(newValue);

                if (index < length - 1) focusInput(index + 1);
            } else {
                event.target.value = EMPTY_STRING;
            }
        }, [updateValue, focusInput, value, length]);

        const handlePaste = useCallback((event, index) => {
            event.preventDefault();
            const pastedData = event.clipboardData.getData('text').replace(/\D/g, EMPTY_STRING);

            if (pastedData) {
                const newValue = Array.from({ length }, (_, i) => {
                    if (i >= index && pastedData[i - index]) return pastedData[i - index];
                    return value[i] || EMPTY_STRING;
                }).join(EMPTY_STRING);

                updateValue(newValue);
                focusInput(Math.min(index + pastedData.length, length - 1));
            }
            onBlur?.(event);
        }, [updateValue, focusInput, value, length, onBlur]);

        const handleKeyDown = useCallback((event, index) => {
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    if (index > 0) {
                        focusInput(index - 1);
                        selectInput(index - 1);
                    }
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    if (index < length - 1) {
                        focusInput(index + 1);
                        selectInput(index + 1);
                    }
                    break;
                case 'Backspace':
                case 'Delete': {
                    event.preventDefault();
                    const isBackspace = event.key === 'Backspace';

                    const newValue = value.substring(0, index) + (isBackspace && index > 0 ? value.substring(index + 1) : value.substring(index + 1));

                    updateValue(newValue);

                    if (isBackspace && index > 0) focusInput(index - 1);
                    break;
                }
                default:
                    if (value.length === 1) focusInput(value.length);
                    onKeyDown?.(event);
                    break;
            }
        }, [focusInput, selectInput, updateValue, onKeyDown, value, length]);

        const handleClick = useCallback((index) => {
            focusInput(index);
            selectInput(index);
        }, [focusInput, selectInput]);

        return (
            <Stack
                direction="row"
                spacing={props.spacing ?? 1}
                divider={props.divider}
                sx={{ width: props.fullWidth ? '100%' : undefined }}
            >
                {Array.from({ length }).map((_, index) => {
                    return (
                        <InputBase
                            key={`${props.name}_${index}`}
                            id={`${props.name}_${index}`}
                            name={props.name}
                            value={value[index] || EMPTY_STRING}
                            disabled={props.disabled}
                            readOnly={props.readOnly}
                            error={props.error}
                            inputRef={(ele) => inputRefs.current[index] = ele}
                            onChange={(event) => handleChange(event, index)}
                            onKeyDown={(event) => handleKeyDown(event, index)}
                            onPaste={(event) => handlePaste(event, index)}
                            onClick={() => handleClick(index)}
                            onBlur={onBlur}
                            inputProps={{
                                inputMode: 'numeric',
                                maxLength: 1,
                                pattern: '[0-9]*',
                                sx: {
                                    textAlign: 'center',
                                    typography: variant ?? 'normal',
                                },
                            }}
                            sx={{
                                backgroundColor: backgroundColor ?? theme.palette.grey[100],
                                borderRadius: borderRadius ?? theme.shape.borderRadius,
                                padding: padding ?? theme.spacing(1.25, 2),
                                transition: theme.transitions.create([
                                    'border-color',
                                    'background-color',
                                ]),
                                borderWidth: 1,
                                borderStyle: 'solid',
                                borderColor: theme.palette.grey[100],
                                [`&.${inputBaseClasses.focused}`]: {
                                    borderColor: 'primary.main',
                                    [`&:hover`]: {
                                        borderColor: 'primary.main',
                                    },
                                },
                                [`&.${inputBaseClasses.error}`]: {
                                    borderColor: 'error.main',
                                },
                                [`&.${inputBaseClasses.disabled}`]: {
                                    borderColor: 'transparent',
                                    backgroundColor: 'divider',
                                },
                                [`&:hover`]: {
                                    borderColor: 'primary.lighter',
                                },
                            }}
                        />
                    );
                })}
            </Stack>
        );
    }
);