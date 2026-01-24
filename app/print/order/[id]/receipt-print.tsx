"use client";

import Image from "next/image";

type Order = {
  id: string;
  order_number: number;
  order_type: string;
  due_at: string;
  created_at?: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string | null;
  customer_address_snapshot: string | null;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string | null;
  payment_status: string;
  notes: string | null;
};

type OrderItem = {
  id: string;
  item_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
};

export function ReceiptPrint({
  order,
  items,
}: {
  order: Order;
  items: OrderItem[];
}) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <style jsx global>{`
        .receipt-container {
          width: 58mm;
          max-width: 58mm;
          margin: 0 auto;
          padding: 8mm 4mm;
          background: white;
          color: black;
          font-family: "Courier New", monospace;
          font-size: 12px;
          line-height: 1.4;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }

        .receipt-logo {
          margin-bottom: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .receipt-logo img {
          max-width: 30mm;
          height: auto;
          object-fit: contain;
          filter: grayscale(100%);
          display: block;
          margin: 0 auto;
        }

        .receipt-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .receipt-address {
          font-size: 10px;
          color: #666;
          margin-bottom: 2px;
        }

        .receipt-phone {
          font-size: 10px;
          color: #666;
          margin-bottom: 4px;
        }

        .receipt-section {
          margin-bottom: 10px;
        }

        .receipt-label {
          font-weight: bold;
          margin-bottom: 2px;
        }

        .receipt-value {
          margin-bottom: 4px;
        }

        .items-table {
          width: 100%;
          margin: 10px 0;
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 8px 0;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .item-name {
          flex: 1;
        }

        .item-details {
          display: flex;
          align-items: center;
          margin: 0 8px;
          font-size: 11px;
        }

        .item-unit-price {
          margin-right: 4px;
        }

        .item-qty {
          color: #666;
        }

        .item-price {
          text-align: right;
          min-width: 50px;
        }

        .totals-section {
          margin-top: 10px;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .total-final {
          font-weight: bold;
          font-size: 14px;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 2px solid #000;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 16px;
          padding-top: 8px;
          border-top: 1px dashed #000;
          font-size: 12px;
        }

        .print-actions {
          display: none;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .receipt-container {
            width: 58mm;
            max-width: 58mm;
            margin: 0;
            padding: 8mm 4mm;
          }

          .print-actions {
            display: none !important;
          }

          @page {
            size: 58mm auto;
            margin: 0;
          }
        }

        @media screen {
          .receipt-container {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
          }

          .print-actions {
            display: block;
            text-align: center;
            margin-top: 20px;
            padding: 20px;
          }
        }
      `}</style>

      <div className="receipt-container">
      <div className="receipt-header">
        <div className="receipt-logo">
          <Image
            src="/logo.jpg"
            alt="Kitchen Express"

            width={50}
            height={50}
            style={{ maxWidth: "30mm", height: "auto", filter: "grayscale(100%)" }}
            priority
          />
        </div>
        <div className="receipt-title">Kitchen Express</div>
        <div className="receipt-address">Supertech Capetown, Sector-74</div>
        <div className="receipt-phone">Phone: 7987007014</div>
      </div>

      <div className="receipt-section">
        <div className="receipt-label">Order #{order.order_number}</div>
        <div className="receipt-value">
          Ordered: {order.created_at ? formatDateTime(order.created_at) : formatDateTime(new Date().toISOString())}
        </div>
      </div>

        <div className="receipt-section">
          <div className="receipt-label">Customer:</div>
          <div className="receipt-value">{order.customer_name_snapshot}</div>
          {order.customer_phone_snapshot && (
            <div className="receipt-value">{order.customer_phone_snapshot}</div>
          )}
          {order.customer_address_snapshot && (
            <div className="receipt-value" style={{ fontSize: "11px" }}>
              {order.customer_address_snapshot}
            </div>
          )}
        </div>

        <div className="items-table">
          {items.map((item) => (
            <div key={item.id} className="item-row">
              <div className="item-name">{item.item_name_snapshot}</div>
              <div className="item-details">
                <span className="item-unit-price">₹{item.unit_price_snapshot.toFixed(2)}</span>
                <span className="item-qty"> x {item.quantity}</span>
              </div>
              <div className="item-price">₹{item.line_total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="totals-section">
          {order.subtotal !== order.total && (
            <>
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="total-row">
                  <span>Delivery:</span>
                  <span>₹{order.delivery_fee.toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="total-row">
                  <span>Discount:</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          <div className="total-row total-final">
            <span>Total:</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="receipt-section">
            <div className="receipt-label">Notes:</div>
            <div className="receipt-value" style={{ fontSize: "11px" }}>
              {order.notes}
            </div>
          </div>
        )}

        <div className="receipt-footer">
          <div style={{ marginBottom: "4px", fontSize: "11px" }}>
            Made with ❤️
          </div>
          <div style={{ marginBottom: "6px", fontWeight: "bold", fontSize: "12px" }}>
            We appreciate your order!
          </div>
          <div style={{ fontSize: "10px", color: "#666" }}>
            Please order from us again
          </div>
        </div>

        <div className="print-actions">
          <button
            onClick={() => window.print()}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Print Receipt
          </button>
        </div>
      </div>
    </>
  );
}
