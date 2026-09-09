---
title: Softmax 与多分类
description: 理解 Softmax 的作用、输出含义和考试常见辨析。
category: 深度学习
tags: Softmax,激活函数,多分类
updatedAt: 2026-08-31
order: 1
---

# Softmax 与多分类

Softmax 把一组任意实数转换为 **0 到 1 之间、总和为 1** 的概率分布。它通常放在多分类模型的输出层。

## 核心结论

- 多分类且类别互斥：常用 Softmax。
- 二分类：常见做法是一个输出节点配合 Sigmoid。
- Softmax 不负责提取特征，它负责把输出变成可比较的概率。

## 公式直觉

对每个输出先取指数，再除以全部指数之和。更大的原始输出会得到更高概率，但所有类别仍会共同竞争 1 的总概率。

## 易错辨析

Softmax 与 Sigmoid 都能产生 0 到 1 的结果，但 Sigmoid 对每个输出独立计算；Softmax 的各类别相互关联，概率之和为 1。

## 考试速记

> Softmax = 互斥多分类的概率分布。
