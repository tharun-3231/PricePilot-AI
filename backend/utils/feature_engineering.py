import pandas as pd
import numpy as np


def engineer_features(df):

    # Convert numeric columns safely
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
            ).fillna(0)

    # Create revenue only if it doesn't exist
    if (
        "revenue" not in df.columns and
        "price" in df.columns and
        "sales" in df.columns
    ):

        df["revenue"] = (
            df["price"] *
            df["sales"]
        )

    # Competitor price difference
    if (
        "competitorPrice" in df.columns and
        "price" in df.columns
    ):

        df["priceDifference"] = (
            df["competitorPrice"] -
            df["price"]
        )

    # Average revenue per sale
    if (
        "revenue" in df.columns and
        "sales" in df.columns
    ):

        df["averageRevenue"] = (
            df["revenue"] /
            df["sales"].replace(0, 1)
        )

    # Demand level
    if "sales" in df.columns:

        df["demandLevel"] = np.where(
            df["sales"] > 100,
            "High",
            np.where(
                df["sales"] > 50,
                "Medium",
                "Low"
            )
        )

    # Stock status
    if "stock" in df.columns:

        df["stockStatus"] = np.where(
            df["stock"] < 20,
            "Low Stock",
            "Available"
        )

    # Profit estimate
    if (
        "price" in df.columns and
        "competitorPrice" in df.columns
    ):

        df["profitMargin"] = (
            (
                df["price"] -
                df["competitorPrice"]
            ) /
            df["price"].replace(0, 1)
        ) * 100

    # Remove invalid values
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

    return df