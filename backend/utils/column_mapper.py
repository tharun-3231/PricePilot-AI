COLUMN_MAP = {

    "product": [
        "product",
        "product_name",
        "product name",
        "name",
        "item",
        "title",
        "product_title"
    ],

    "category": [
        "category",
        "product_category",
        "product category",
        "type",
        "department",
        "product_category_name"
    ],

    "brand": [
        "brand",
        "company",
        "manufacturer",
        "vendor"
    ],

    "price": [
        "price",
        "selling price",
        "selling_price",
        "amount",
        "cost",
        "unit_price",
        "sale_price"
    ],

    "stock": [
        "stock",
        "inventory",
        "qty",
        "quantity",
        "available",
        "inventory_level"
    ],

    "sales": [
        "sales",
        "sold",
        "units sold",
        "orders",
        "order_count"
    ],

    "revenue": [
        "revenue",
        "income",
        "turnover",
        "total_revenue"
    ],

    "competitorPrice": [
        "competitorprice",
        "competitor price",
        "competitor_price",
        "marketprice",
        "market price"
    ],

    "month": [
        "month",
        "date",
        "order month",
        "order_month"
    ]

}


def normalize_dataframe(df):

    rename_dict = {}

    for column in df.columns:

        cleaned = (
            column
            .strip()
            .lower()
            .replace("_", " ")
        )

        mapped = None

        for standard, aliases in COLUMN_MAP.items():

            if cleaned in aliases:

                mapped = standard

                break

        if mapped:

            rename_dict[column] = mapped

        else:

            rename_dict[column] = (
                column
                .strip()
                .replace(" ", "_")
            )

    df = df.rename(columns=rename_dict)

    return df