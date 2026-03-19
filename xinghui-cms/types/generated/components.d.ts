import type { Schema, Struct } from '@strapi/strapi';

export interface SharedProductFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_product_features';
  info: {
    description: '\u4EA7\u54C1\u7279\u6027';
    displayName: 'ProductFeature';
  };
  attributes: {
    content: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStatItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat_items';
  info: {
    description: '\u6570\u5B57\u4EAE\u70B9';
    displayName: 'StatItem';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    number: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.product-feature': SharedProductFeature;
      'shared.stat-item': SharedStatItem;
    }
  }
}
