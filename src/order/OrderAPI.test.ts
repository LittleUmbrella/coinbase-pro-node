import nock from 'nock';
import {NewOrder, OrderAPI, OrderStatus, OrderType, SelfTradePrevention} from './OrderAPI';
import {OrderSide} from '../payload';
import {AxiosError} from 'axios';

describe('OrderAPI', () => {
  afterEach(() => nock.cleanAll());

  describe('placeOrder', () => {
    it('places market buy orders', async () => {
      nock(global.REST_URL)
        .post(OrderAPI.URL.ORDERS)
        .query(true)
        .reply((_uri, body) => {
          const newOrder: NewOrder = typeof body === 'string' ? JSON.parse(body) : body;

          return [
            200,
            JSON.stringify({
              created_at: '2019-04-22T20:21:20.897409Z',
              executed_value: '0.0000000000000000',
              fill_fees: '0.0000000000000000',
              filled_size: '0.00000000',
              funds: '207850.8486540300000000',
              id: '8eba9e7b-08d6-4667-90ca-6db445d743c0',
              post_only: false,
              product_id: newOrder.product_id,
              settled: false,
              side: newOrder.side,
              size: '0.10000000',
              status: OrderStatus.PENDING,
              stp: SelfTradePrevention.DECREMENT_AND_CANCEL,
              type: newOrder.type,
            }),
          ];
        });

      const placedOrder = await global.client.rest.order.placeOrder({
        product_id: 'BTC-EUR',
        side: OrderSide.BUY,
        size: '0.1',
        type: OrderType.MARKET,
      });

      expect(placedOrder.size).toBe('0.10000000');
      expect(placedOrder.status).toBe(OrderStatus.PENDING);
    });

    it('places limit buy orders', async () => {
      nock(global.REST_URL)
        .post(OrderAPI.URL.ORDERS)
        .query(true)
        .reply((_uri, body) => {
          const newOrder: NewOrder = typeof body === 'string' ? JSON.parse(body) : body;

          return [
            200,
            JSON.stringify({
              created_at: '2022-07-02T15:29:10.132Z',
              executed_value: '0.0000000000000000',
              fill_fees: '0.0000000000000000',
              filled_size: '0.00000000',
              funds: '207850.8486540300000000',
              id: 'b0ba16c1-749c-4f96-b2e5-95192d721f92',
              post_only: false,
              product_id: newOrder.product_id,
              settled: false,
              side: newOrder.side,
              size: '1.00000000',
              status: OrderStatus.PENDING,
              stp: SelfTradePrevention.DECREMENT_AND_CANCEL,
              type: newOrder.type,
            }),
          ];
        });

      const placedOrder = await global.client.rest.order.placeOrder({
        price: '18427.33',
        product_id: 'BTC-EUR',
        side: OrderSide.BUY,
        size: '1',
        type: OrderType.LIMIT,
      });

      expect(placedOrder.size).toBe('1.00000000');
      expect(placedOrder.status).toBe(OrderStatus.PENDING);
    });
  });

  describe('getOrders', () => {
    it('returns list of open orders', async () => {
      nock(global.REST_URL)
        .get(OrderAPI.URL.ORDERS)
        .query(true)
        .reply(200, (uri: string) => {
          expect(uri).toBe('/orders');

          return JSON.stringify([
            {
              created_at: '2019-04-22T20:21:20.897409Z',
              executed_value: '0.0000000000000000',
              fill_fees: '0.0000000000000000',
              filled_size: '0.00000000',
              funds: '207850.8486540300000000',
              id: '8eba9e7b-08d6-4667-90ca-6db445d743c0',
              post_only: false,
              product_id: 'BTC-EUR',
              settled: false,
              side: OrderSide.BUY,
              size: '0.10000000',
              status: OrderStatus.OPEN,
              stp: SelfTradePrevention.DECREMENT_AND_CANCEL,
              type: OrderType.MARKET,
            },
          ]);
        });

      const openOrders = await global.client.rest.order.getOrders();

      expect(openOrders.data.length).toBe(1);
      expect(openOrders.data[0].status).toBe(OrderStatus.OPEN);
    });

    it('accepts a list of different order statuses', async () => {
      nock(global.REST_URL)
        .get(OrderAPI.URL.ORDERS)
        .query(true)
        .reply(200, (uri: string) => {
          expect(uri).toBe('/orders?status=open&status=pending');

          return JSON.stringify([
            {
              created_at: '2019-04-22T20:21:20.897409Z',
              executed_value: '0.0000000000000000',
              fill_fees: '0.0000000000000000',
              filled_size: '0.00000000',
              funds: '207850.8486540300000000',
              id: '8eba9e7b-08d6-4667-90ca-6db445d743c0',
              post_only: false,
              product_id: 'BTC-EUR',
              settled: false,
              side: OrderSide.BUY,
              size: '0.10000000',
              status: OrderStatus.OPEN,
              stp: SelfTradePrevention.DECREMENT_AND_CANCEL,
              type: OrderType.MARKET,
            },
          ]);
        });

      const openOrders = await global.client.rest.order.getOrders({
        status: [OrderStatus.OPEN, OrderStatus.PENDING],
      });

      expect(openOrders.data.length).toBe(1);
    });
  });

  describe('getOrder', () => {
    it('returns correct order information', async () => {
      const orderId = '8eba9e7b-08d6-4667-90ca-6db445d743c1';

      nock(global.REST_URL)
        .get(`${OrderAPI.URL.ORDERS}/${orderId}`)
        .query(true)
        .reply(
          200,
          JSON.stringify({
            created_at: '2016-12-08T20:09:05.508883Z',
            done_at: '2016-12-08T20:09:05.527Z',
            done_reason: 'filled',
            executed_value: '9.9750556620000000',
            fill_fees: '0.0249376391550000',
            filled_size: '0.01291771',
            funds: '9.9750623400000000',
            id: orderId,
            post_only: false,
            product_id: 'BTC-USD',
            settled: true,
            side: OrderSide.BUY,
            size: '1.00000000',
            specified_funds: '10.0000000000000000',
            status: 'done',
            stp: SelfTradePrevention.DECREMENT_AND_CANCEL,
            type: 'market',
          })
        );

      const order = await global.client.rest.order.getOrder('8eba9e7b-08d6-4667-90ca-6db445d743c1');
      expect(order!.id).toBe('8eba9e7b-08d6-4667-90ca-6db445d743c1');
    });

    it('returns null if an order cannot be found', async () => {
      nock(global.REST_URL).get(`${OrderAPI.URL.ORDERS}/123`).query(true).reply(404);

      const order = await global.client.rest.order.getOrder('123');

      expect(order).toEqual(null);
    });

    it('rethrows errors with status code other than 404', async () => {
      nock(global.REST_URL).get(`${OrderAPI.URL.ORDERS}/123`).query(true).reply(403);

      try {
        await global.client.rest.order.getOrder('123');
      } catch (error) {
        expect((error as AxiosError).response!.status).toBe(403);
      }
    });
  });

  describe('cancelOrder', () => {
    it('correctly deletes a specific order', async () => {
      nock(global.REST_URL)
        .delete(`${OrderAPI.URL.ORDERS}/8eba9e7b-08d6-4667-90ca-6db445d743c1`)
        .query(true)
        .reply(200, '8eba9e7b-08d6-4667-90ca-6db445d743c1');

      const canceledOrderId = await global.client.rest.order.cancelOrder('8eba9e7b-08d6-4667-90ca-6db445d743c1');
      expect(canceledOrderId).toEqual('8eba9e7b-08d6-4667-90ca-6db445d743c1');
    });

    it('creates more performant requests when passing the product ID', async () => {
      nock(global.REST_URL)
        .delete(`${OrderAPI.URL.ORDERS}/8eba9e7b-08d6-4667-90ca-6db445d743c1`)
        .query(true)
        .reply(200, '8eba9e7b-08d6-4667-90ca-6db445d743c1');

      const canceledOrderId = await global.client.rest.order.cancelOrder(
        '8eba9e7b-08d6-4667-90ca-6db445d743c1',
        'BTC-USD'
      );
      expect(canceledOrderId).toEqual('8eba9e7b-08d6-4667-90ca-6db445d743c1');
    });
  });

  describe('cancelOpenOrders', () => {
    it('correctly deletes all open orders if no productId is passed', async () => {
      nock(global.REST_URL)
        .delete(`${OrderAPI.URL.ORDERS}`)
        .query(true)
        .reply(200, ['8eba9e7b-08d6-4667-90ca-6db445d743c1']);

      const canceledOrderIds = await global.client.rest.order.cancelOpenOrders();

      expect(canceledOrderIds).toEqual(['8eba9e7b-08d6-4667-90ca-6db445d743c1']);
    });

    it('correctly deletes all open orders for just the provided productId', async () => {
      nock(global.REST_URL)
        .delete(`${OrderAPI.URL.ORDERS}?product_id=ETH-EUR`)
        .reply(200, ['8eba9e7b-08d6-4667-90ca-6db445d743c1']);

      const canceledOrderIds = await global.client.rest.order.cancelOpenOrders('ETH-EUR');

      expect(canceledOrderIds).toEqual(['8eba9e7b-08d6-4667-90ca-6db445d743c1']);
    });
  });
});
