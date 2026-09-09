---
title: 分类模型评估指标
description: 一次分清 Accuracy、Precision、Recall、F1 和 AUC。
category: 模型评估
tags: Precision,Recall,F1,AUC
updatedAt: 2026-08-29
order: 3
---

# 分类模型评估指标

选择指标前，先问清楚业务最怕哪一种错误。类别不平衡时，单看准确率往往会误导。

## Accuracy 准确率

全部样本中预测正确的比例。适合类别相对均衡、不同错误代价接近的场景。

## Precision 精确率

预测为正的样本中，实际为正的比例。**误报代价高**时更值得关注。

## Recall 召回率

实际为正的样本中，被成功找出的比例。**漏报代价高**时优先关注。

## F1

Precision 与 Recall 的调和平均，用于在二者间取得平衡。

## AUC

衡量模型在不同阈值下区分正负样本的整体能力。越接近 1，通常说明区分能力越强。

## 记忆方式

- Precision：你说“是”的里面，有多少真是。
- Recall：真正“是”的里面，你找回多少。
