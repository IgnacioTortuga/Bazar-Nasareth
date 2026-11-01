export function serviceInquiryUrl(service, business, language = 'es') {
  let phone = (business.telefono || '').replace(/\D/g, '');
  if (phone.length === 8) phone = '506' + phone;
  if (!/^[1-9]\d{7,14}$/.test(phone)) return '#contacto';
  const message =
    language === 'en'
      ? `Hello, I would like to ask about the service “${service.nombre}”. Could you tell me the price, availability and terms?`
      : `Hola, quisiera consultar por el servicio «${service.nombre}». ¿Me pueden indicar el precio, la disponibilidad y las condiciones?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
