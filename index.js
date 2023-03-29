require('dotenv').config()
const axios = require('axios');
const json2csv = require('json2csv').parse;
const fs = require('fs');

const apiUrl = 'https://tw.fd-api.com/api/v5/orders/order_history';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'authorization': `Bearer ${process.env.AUTH_TOKEN}`,
    'x-fp-api-key': 'volo'
};

const params = {
    include: 'order_products,order_details',
    language_id: process.env.LANG_ID ?? 6,
    offset: process.env.OD_OFFSET ?? 0,
    limit: process.env.OD_LIMIT ?? 20,
}

const fields = ['訂單號', '日期', '商家', '品項', '數量', '金額'];
const fees_desc = {
    NEXTGEN_DELIVERY_FEE: '外送服務費',
    NEXTGEN_DRIVER_TIP: '外送夥伴小費',
    NEXTGEN_COUT_VOUCHER: '優惠券',
    NEXTGEN_CART_DISCOUNT: '折扣',
    NEXTGEN_TOTAL_VAT: '總計 （含稅）',
    NEXTGEN_CART_SUBTOTAL: '小計',
    NEXTGEN_CART_CONTAINER_CHARGES: '外賣包裝費用',
};

const getRows = function (items) {
    return items.map(item => [
        ...item.order_products.map(product => ({
            '訂單號': item.order_code,
            '日期': item.ordered_at.date,
            '商家': item.vendor.name,
            '品項': product.name + (product.toppings_attributes ? `\n${product.toppings_attributes.value}` : ''),
            '數量': product.quantity,
            '金額': product.total_price,
        })),
        ...item.dynamic_fees.map(fee => ({
            '訂單號': item.order_code,
            '日期': item.ordered_at.date,
            '商家': '',
            '品項': (fees_desc[fee.translation_key] ?? fee.translation_key) + (fee.name ? `:${fee.name}` : ''),
            '數量': 1,
            '金額': fee.value,
        })),
    ]).flat()
};

axios.get(apiUrl, { params, headers })
    .then((response) => {
        let rows = getRows(response.data.data.items)
        let csvData = json2csv(rows, fields)
        fs.writeFile(`output/orders_${Date.now().toString()}.csv`, csvData, (error) => {
            if (error) throw error;
            console.log('Orders saved to file.');
        });
    })
    .catch((error) => {
        console.log(error);
    });
