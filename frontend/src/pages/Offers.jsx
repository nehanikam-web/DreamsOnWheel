import PageHeader from '../components/PageHeader';
import OfferCards from '../components/OfferCards';

export default function Offers() {
  return (
    <>
      <PageHeader title="Special Offers" subtitle="Copy a code and apply it on the booking page." crumbs={[{ label: 'Offers' }]} />
      <div className="container" style={{ padding: '40px 20px 64px' }}>
        <OfferCards />
        <div className="panel mt">
          <h3>Terms</h3>
          <ul className="muted" style={{ lineHeight: 1.9 }}>
            <li>One coupon can be used per booking.</li>
            <li>Discounts apply to the rental and driver charges, not to the security deposit.</li>
            <li>Offers cannot be combined and may be withdrawn without notice.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
