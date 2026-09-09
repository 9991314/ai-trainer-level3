---
title: Pandas 数据清洗检查表
description: 从读取、检查到缺失值和重复值处理的实操流程。
category: 数据处理
tags: Pandas,数据清洗,缺失值
updatedAt: 2026-08-30
order: 2
---

# Pandas 数据清洗检查表

数据清洗题的关键不是堆方法，而是形成稳定、可验证的处理顺序。

## 标准流程

1. 读取：确认编码、分隔符和表头。
2. 检查：查看 `shape`、`info()`、空值与重复值。
3. 清洗：处理缺失、重复、异常和错误类型。
4. 验证：再次检查统计量和行数变化。
5. 保存：按题目要求输出文件，不保留多余索引。

## 常用代码

```python
import pandas as pd

df = pd.read_csv("input.csv")
df = df.drop_duplicates()
df["age"] = df["age"].fillna(df["age"].median())
df.to_csv("cleaned.csv", index=False)
```

## 常见扣分点

- 只写处理语句，没有保存或赋值。
- 用均值处理明显偏态或含异常值的数据，却没有解释。
- 清洗后没有验证空值、重复数和数据类型。
