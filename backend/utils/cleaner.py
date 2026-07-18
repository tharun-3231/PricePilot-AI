import pandas as pd
import numpy as np


def clean_dataset(df):

    report = {}

    report["rows_before"] = len(df)

    df.columns = (
        df.columns
        .str.strip()
        .str.replace(" ", "_")
    )

    duplicates = df.duplicated().sum()

    df = df.drop_duplicates()

    report["duplicates_removed"] = int(duplicates)

    df.replace(
        [
            "",
            " ",
            "NA",
            "N/A",
            "null",
            "None",
            "NaN"
        ],
        np.nan,
        inplace=True
    )

    numeric_columns = [

        "price",

        "stock",

        "sales",

        "revenue",

        "competitorPrice"

    ]

    for col in numeric_columns:

        if col in df.columns:

            df[col] = pd.to_numeric(

                df[col],

                errors="coerce"

            )

            df[col] = df[col].fillna(0)

    text_columns = [

        "product",

        "category",

        "brand",

        "month"

    ]

    for col in text_columns:

        if col in df.columns:

            df[col] = (

                df[col]

                .fillna("Unknown")

                .astype(str)

                .str.strip()

            )

    df.replace(

        [np.inf, -np.inf],

        0,

        inplace=True

    )

    for col in df.columns:
        if df[col].dtype == object or pd.api.types.is_string_dtype(df[col]):
            df[col] = df[col].fillna("Unknown")
        else:
            df[col] = df[col].fillna(0)

    report["rows_after"] = len(df)

    report["missing_values"] = int(df.isna().sum().sum())

    return df, report